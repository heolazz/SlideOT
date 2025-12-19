import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const exportPresentationToPDF = async (containerId: string): Promise<void> => {
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [960, 540], 
        hotfixes: ['px_scaling']
    });

    const exportContainer = document.getElementById(containerId);
    if (!exportContainer) throw new Error("Export container not found");

    const slideElements = exportContainer.children;
    
    for (let i = 0; i < slideElements.length; i++) {
        if (i > 0) pdf.addPage();
        
        const slideEl = slideElements[i] as HTMLElement;
        
        const canvas = await html2canvas(slideEl, {
            scale: 3, 
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        pdf.addImage(imgData, 'JPEG', 0, 0, 960, 540);
    }

    pdf.save('presentation.pdf');
};