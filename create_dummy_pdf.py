from reportlab.pdfgen import canvas

def create_pdf(filename):
    c = canvas.Canvas(filename)
    c.setFont("Helvetica", 12)
    c.drawString(100, 750, "John Doe - Senior Software Engineer")
    c.drawString(100, 730, "Experience: 5 years building scalable web applications.")
    c.drawString(100, 710, "Skills:")
    c.drawString(120, 690, "- Python")
    c.drawString(120, 670, "- React")
    c.drawString(120, 650, "- SQL")
    c.drawString(120, 630, "- Machine Learning")
    c.drawString(100, 600, "Worked with Flask and Django in the backend.")
    c.save()

if __name__ == "__main__":
    create_pdf("dummy_resume.pdf")
