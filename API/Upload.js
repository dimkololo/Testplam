import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const form = formidable({ multiples: false });
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Ошибка загрузки' });

    console.log('✅ Получен файл:', files.photo?.originalFilename);
    console.log('📋 Метаданные:', fields);

    res.status(200).json({ message: 'Файл и данные получены успешно!' });
  });
}
