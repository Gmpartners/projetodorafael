# Ler o arquivo
with open('src/services/apiService.js', 'r') as f:
    lines = f.readlines()

# Procurar por linhas duplicadas consecutivas "return response.data;"
fixed_lines = []
skip_next = False

for i in range(len(lines)):
    if skip_next:
        skip_next = False
        continue
        
    # Se a linha atual e a próxima são "    return response.data;"
    if (i < len(lines) - 1 and 
        lines[i].strip() == "return response.data;" and 
        lines[i+1].strip() == "return response.data;"):
        # Adiciona apenas uma vez
        fixed_lines.append(lines[i])
        skip_next = True
    else:
        fixed_lines.append(lines[i])

# Salvar
with open('src/services/apiService.js', 'w') as f:
    f.writelines(fixed_lines)

print("✅ Sintaxe corrigida - removida duplicação!")
