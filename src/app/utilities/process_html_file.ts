import * as fs from 'fs';
import handlebars from 'handlebars';

export const read_html_file = async (
  path: string,
  template_values: Record<string, string>,
) => {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
      if (err) {
        reject(err);
      } else {
        const template = handlebars.compile(html);
        const templated_email = template(template_values);

        resolve(templated_email);
      }
    });
  });
};
