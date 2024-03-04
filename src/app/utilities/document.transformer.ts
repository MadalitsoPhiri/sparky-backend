import { Document } from 'mongoose';
export class DocumentTransformer {
  async transformExclude(fields: string[], document: Document) {
    const finalDocument = document.toJSON();

    for (let i = 0; i < fields.length; i++) {
      if (finalDocument.hasOwnProperty(fields[i])) {
        delete finalDocument[fields[i]];
      }
    }

    return finalDocument;
  }

  async transformInclude(fields: string[], document: Document) {
    const final = {};
    const semifinal = document.toJSON();
    for (let i = 0; i < fields.length; i++) {
      if (semifinal.hasOwnProperty(fields[i])) {
        final[fields[i]] = semifinal[fields[i]];
      }
    }
    return final;
  }
}
