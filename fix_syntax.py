# Ler o arquivo
with open('src/services/apiService.js', 'r') as f:
    content = f.read()

# Corrigir sintaxe (remover },);)
content = content.replace('},);', '},')

# Salvar
with open('src/services/apiService.js', 'w') as f:
    f.write(content)

print("✅ Sintaxe corrigida!")
