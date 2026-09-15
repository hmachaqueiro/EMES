from pypdf import PdfReader
from pathlib import Path

pdf = Path('reqs/requisitos.pdf')
reader = PdfReader(str(pdf))
text = '\n'.join(page.extract_text() or '' for page in reader.pages)
lower = text.lower()
start = lower.find('3. requisitos funcionais')
if start == -1:
    start = lower.find('requisitos funcionais')
if start == -1:
    start = lower.find('estrutura dos requisitos')
if start == -1:
    start = 0
end = lower.find('4. caráter vinculativo')
if end == -1:
    end = lower.find('anexo')
if end == -1:
    end = len(text)
section = text[start:end]

out = Path('reqs/requisitos_texto.txt')
out.write_text(section, encoding='utf-8')
print(f'Arquivo salvo em {out}')
print(f'Caracteres: {len(section)}')
print(section[:5000])
