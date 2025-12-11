from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from datetime import datetime


def generate_offer_pdf(offer):
    """
    Génère un PDF pour une offre de stage avec toutes ses candidatures
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    
    # Container pour les éléments du PDF
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Titre principal
    title = Paragraph(f"Rapport de Stage - {offer.title}", title_style)
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    # Informations sur l'offre
    offer_info = [
        ['Organisme:', offer.organisme],
        ['Contact:', f"{offer.contact_name} ({offer.contact_email})"],
        ['Date de dépôt:', offer.date_depot.strftime('%d/%m/%Y %H:%M')],
        ['État:', offer.get_state_display()],
        ['Nombre de candidatures:', str(offer.candidature_set.count())],
    ]
    
    offer_table = Table(offer_info, colWidths=[2*inch, 4*inch])
    offer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    
    elements.append(offer_table)
    elements.append(Spacer(1, 20))
    
    # Description du stage
    elements.append(Paragraph("Description du stage", heading_style))
    description = Paragraph(offer.description.replace('\n', '<br/>'), styles['Normal'])
    elements.append(description)
    elements.append(Spacer(1, 20))
    
    # Liste des candidatures
    candidatures = offer.candidature_set.all().order_by('-date_candidature')
    
    if candidatures.exists():
        elements.append(Paragraph(f"Candidatures ({candidatures.count()})", heading_style))
        elements.append(Spacer(1, 12))
        
        # En-têtes du tableau
        data = [['#', 'Étudiant', 'Email', 'Téléphone', 'Date', 'Statut']]
        
        # Données des candidatures
        for idx, candidature in enumerate(candidatures, 1):
            student = candidature.student
            profile_phone = 'N/A'
            try:
                if hasattr(student, 'studentprofile') and student.studentprofile.phone:
                    profile_phone = student.studentprofile.phone
            except:
                pass
            
            data.append([
                str(idx),
                f"{student.first_name} {student.last_name}",
                student.email,
                profile_phone,
                candidature.date_candidature.strftime('%d/%m/%Y'),
                candidature.get_status_display()
            ])
        
        # Créer le tableau des candidatures
        candidature_table = Table(data, colWidths=[0.5*inch, 1.5*inch, 2*inch, 1.2*inch, 1*inch, 1*inch])
        candidature_table.setStyle(TableStyle([
            # En-tête
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Corps du tableau
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            
            # Alternance de couleurs
            *[('BACKGROUND', (0, i), (-1, i), colors.white if i % 2 == 0 else colors.HexColor('#f3f4f6'))
              for i in range(1, len(data))]
        ]))
        
        elements.append(candidature_table)
    else:
        elements.append(Paragraph("Aucune candidature pour cette offre", styles['Normal']))
    
    # Footer
    elements.append(Spacer(1, 40))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER
    )
    footer = Paragraph(
        f"Document généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')} - IUT Orsay - Gestion des Stages",
        footer_style
    )
    elements.append(footer)
    
    # Construire le PDF
    doc.build(elements)
    
    # Récupérer le PDF
    pdf = buffer.getvalue()
    buffer.close()
    
    return pdf


def generate_candidatures_summary_pdf(candidatures):
    """
    Génère un PDF récapitulatif de plusieurs candidatures
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    
    elements = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    # Titre
    title = Paragraph("Rapport des Candidatures", title_style)
    elements.append(title)
    elements.append(Spacer(1, 20))
    
    # Statistiques globales
    total = candidatures.count()
    en_attente = candidatures.filter(statut='en_attente').count()
    acceptees = candidatures.filter(statut='acceptee').count()
    refusees = candidatures.filter(statut='refusee').count()
    
    stats_data = [
        ['Total des candidatures', str(total)],
        ['En attente', str(en_attente)],
        ['Acceptées', str(acceptees)],
        ['Refusées', str(refusees)],
    ]
    
    stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    elements.append(stats_table)
    elements.append(Spacer(1, 30))
    
    # Liste détaillée
    if candidatures.exists():
        data = [['Étudiant', 'Email', 'Offre', 'Entreprise', 'Date', 'Statut']]
        
        for candidature in candidatures.order_by('-date_candidature'):
            student = candidature.student
            offer = candidature.offer
            data.append([
                f"{student.first_name} {student.last_name}",
                student.email,
                offer.title[:30] + '...' if len(offer.title) > 30 else offer.title,
                offer.organisme,
                candidature.date_candidature.strftime('%d/%m/%Y'),
                candidature.get_status_display()
            ])
        
        table = Table(data, colWidths=[1.3*inch, 1.5*inch, 1.5*inch, 1.2*inch, 0.8*inch, 0.9*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            *[('BACKGROUND', (0, i), (-1, i), colors.white if i % 2 == 0 else colors.HexColor('#f3f4f6'))
              for i in range(1, len(data))]
        ]))
        
        elements.append(table)
    
    # Footer
    elements.append(Spacer(1, 40))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER
    )
    footer = Paragraph(
        f"Document généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')} - IUT Orsay",
        footer_style
    )
    elements.append(footer)
    
    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()
    
    return pdf
