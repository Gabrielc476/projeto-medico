import os

try:
    from fpdf import FPDF
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf"])
    from fpdf import FPDF

def create_pdf(filename="dummy_exam.pdf"):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="EXAME LABORATORIAL - RESULTADOS", ln=1, align='C')
    pdf.cell(200, 10, txt="Paciente: Joao Silva", ln=1)
    pdf.cell(200, 10, txt="Hemoglobina: 8.5 g/dL (Referencia: 13.0 - 17.0 g/dL) - BAIXO", ln=1)
    pdf.cell(200, 10, txt="Leucocitos: 15000 /uL (Referencia: 4000 - 10000 /uL) - ALTO", ln=1)
    pdf.cell(200, 10, txt="Plaquetas: 140000 /uL (Referencia: 150000 - 450000 /uL) - BAIXO", ln=1)
    pdf.cell(200, 10, txt="Glicemia: 90 mg/dL (Referencia: 70 - 99 mg/dL) - NORMAL", ln=1)
    
    # Adicionando uma tabela para testar extração estruturada
    pdf.ln(10)
    pdf.cell(200, 10, txt="--- FORMATO TABELA ---", ln=1, align='C')
    pdf.cell(60, 10, txt="EXAME", border=1)
    pdf.cell(60, 10, txt="RESULTADO", border=1)
    pdf.cell(60, 10, txt="REFERENCIA", border=1, ln=1)
    
    pdf.cell(60, 10, txt="Creatinina", border=1)
    pdf.cell(60, 10, txt="1.5 mg/dL (ALTO)", border=1)
    pdf.cell(60, 10, txt="0.7 - 1.2 mg/dL", border=1, ln=1)
    
    pdf.output(filename)
    print(f"PDF criado com sucesso: {os.path.abspath(filename)}")

if __name__ == "__main__":
    create_pdf()
