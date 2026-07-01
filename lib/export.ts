import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/**
 * Menangkap node invoice menjadi canvas.
 *
 * Kuncinya: kita TIDAK menangkap node yang tampil (yang punya ancestor
 * `transform: scale` dari FitToWidth) karena itu membuat html2canvas merender
 * teks dobel/tumpang-tindih. Sebagai gantinya kita kloning node ke container
 * offscreen tanpa transform, pada lebar aslinya, lalu menangkap kloningan itu.
 * Semua style di InvoicePreview bersifat inline sehingga kloning mempertahankan
 * tampilannya dengan sempurna.
 */
async function captureNode(node: HTMLElement): Promise<HTMLCanvasElement> {
  const width = node.offsetWidth || 760;

  const holder = document.createElement("div");
  holder.style.position = "fixed";
  holder.style.left = "-100000px";
  holder.style.top = "0";
  holder.style.width = `${width}px`;
  holder.style.background = "#ffffff";
  holder.style.transform = "none";

  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  holder.appendChild(clone);
  document.body.appendChild(holder);

  // Pastikan font (Manrope) sudah dimuat agar teks tidak meleset saat capture.
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* abaikan */
    }
  }

  // Tunggu gambar (logo) selesai dimuat di kloningan.
  await Promise.all(
    Array.from(clone.querySelectorAll("img")).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
    ),
  );

  try {
    return await html2canvas(clone, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      width,
      windowWidth: width,
    });
  } finally {
    holder.remove();
  }
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function exportToJPG(node: HTMLElement, filename: string) {
  const canvas = await captureNode(node);
  const data = canvas.toDataURL("image/jpeg", 0.95);
  triggerDownload(data, `${filename}.jpg`);
}

export async function exportToPDF(node: HTMLElement, filename: string) {
  const canvas = await captureNode(node);
  const img = canvas.toDataURL("image/jpeg", 0.95);

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const imgW = pageW;
  const imgH = (canvas.height / canvas.width) * imgW;

  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
  heightLeft -= pageH;

  // Pecah ke beberapa halaman bila invoice lebih panjang dari satu A4.
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
  }

  pdf.save(`${filename}.pdf`);
}
