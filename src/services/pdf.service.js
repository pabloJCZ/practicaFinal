import PDFDocument from 'pdfkit';

/**
 * Genera un PDF para un albarán y devuelve un Buffer.
 * @param {Object} deliveryNote - Albarán con datos populados
 */
export const generateDeliveryNotePDF = (deliveryNote) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // --- Cabecera ---
    doc.fontSize(22).font('Helvetica-Bold').text('BildyApp', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('ALBARÁN', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // --- Datos del usuario/empresa ---
    const user = deliveryNote.user;
    const company = deliveryNote.company;
    doc.fontSize(10).font('Helvetica-Bold').text('EMPRESA EMISORA');
    doc.font('Helvetica').text(`Nombre: ${company?.name || user?.name || 'N/A'}`);
    if (company?.cif) doc.text(`CIF: ${company.cif}`);
    if (company?.address?.city) doc.text(`Ciudad: ${company.address.city}`);
    doc.moveDown();

    // --- Datos del cliente ---
    const client = deliveryNote.client;
    doc.font('Helvetica-Bold').text('CLIENTE');
    doc.font('Helvetica').text(`Nombre: ${client?.name || 'N/A'}`);
    if (client?.cif) doc.text(`CIF: ${client.cif}`);
    if (client?.email) doc.text(`Email: ${client.email}`);
    if (client?.address?.city) doc.text(`Ciudad: ${client.address.city}`);
    doc.moveDown();

    // --- Datos del proyecto ---
    const project = deliveryNote.project;
    doc.font('Helvetica-Bold').text('PROYECTO');
    doc.font('Helvetica').text(`Nombre: ${project?.name || 'N/A'}`);
    if (project?.projectCode) doc.text(`Código: ${project.projectCode}`);
    doc.moveDown();

    // --- Datos del albarán ---
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();
    doc.font('Helvetica-Bold').text('DETALLES DEL ALBARÁN');
    doc.font('Helvetica');
    doc.text(`ID: ${deliveryNote._id}`);
    doc.text(`Tipo: ${deliveryNote.format === 'hours' ? 'Horas trabajadas' : 'Materiales'}`);
    doc.text(`Fecha de trabajo: ${new Date(deliveryNote.workDate).toLocaleDateString('es-ES')}`);
    if (deliveryNote.description) doc.text(`Descripción: ${deliveryNote.description}`);
    doc.moveDown();

    if (deliveryNote.format === 'material') {
      doc.font('Helvetica-Bold').text('MATERIALES');
      doc.font('Helvetica').text(`Material: ${deliveryNote.material}`);
      doc.text(`Cantidad: ${deliveryNote.quantity} ${deliveryNote.unit || ''}`);
    } else {
      doc.font('Helvetica-Bold').text('HORAS');
      if (deliveryNote.hours) {
        doc.font('Helvetica').text(`Total horas: ${deliveryNote.hours}h`);
      }
      if (deliveryNote.workers && deliveryNote.workers.length > 0) {
        doc.font('Helvetica-Bold').text('Trabajadores:');
        deliveryNote.workers.forEach((w) => {
          doc.font('Helvetica').text(`  - ${w.name}: ${w.hours}h`);
        });
      }
    }

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // --- Firma ---
    if (deliveryNote.signed) {
      doc.font('Helvetica-Bold').text('ALBARÁN FIRMADO');
      doc.font('Helvetica').text(`Firmado el: ${new Date(deliveryNote.signedAt).toLocaleString('es-ES')}`);
      if (deliveryNote.signatureUrl) {
        doc.text(`Firma digital disponible en: ${deliveryNote.signatureUrl}`);
      }
    } else {
      doc.font('Helvetica-Bold').text('PENDIENTE DE FIRMA');
    }

    doc.end();
  });
};
