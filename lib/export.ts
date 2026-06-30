import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

async function capture(node: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });
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
  const canvas = await capture(node);
  const data = canvas.toDataURL("image/jpeg", 0.95);
  triggerDownload(data, `${filename}.jpg`);
}

export async function exportToPDF(node: HTMLElement, filename: string) {
  const canvas = await capture(node);
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
