# Ícones do PWA

Para o PWA funcionar completamente, você precisa gerar os ícones PNG.

## Opção 1: Gerador Online (Rápido)

1. Acesse https://www.pwabuilder.com/imageGenerator
2. Faça upload do arquivo `icon.svg` desta pasta
3. Baixe os ícones gerados
4. Copie os arquivos para esta pasta `public/`:
   - `icon-192x192.png`
   - `icon-512x512.png`

## Opção 2: Usando Figma/Photoshop

1. Crie um design quadrado de 512x512px
2. Use o gradiente roxo para azul (#8B5CF6 → #3B82F6)
3. Adicione a letra "A" grande e centralizada
4. Exporte em:
   - 192x192px → `icon-192x192.png`
   - 512x512px → `icon-512x512.png`

## Opção 3: Converter SVG para PNG (CLI)

Se você tem ImageMagick instalado:

```bash
# 192x192
magick convert -background none -size 192x192 icon.svg icon-192x192.png

# 512x512
magick convert -background none -size 512x512 icon.svg icon-512x512.png
```

## Favicon

O favicon.ico pode ser gerado do mesmo design. Use https://favicon.io/favicon-converter/

Após gerar os ícones, o PWA estará pronto para instalação!
