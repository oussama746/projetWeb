from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings


def send_registration_email(user):
    """Email de confirmation d'inscription"""
    subject = "Bienvenue sur Stage Connect !"
    message = f"""
Bonjour {user.username},

Votre compte a été créé avec succès sur Stage Connect !

Informations de votre compte :
- Nom d'utilisateur : {user.username}
- Email : {user.email}
- Rôle : {user.groups.first().name if user.groups.exists() else 'Utilisateur'}

Vous pouvez maintenant vous connecter et accéder à la plateforme.

Cordialement,
L'équipe Stage Connect
"""
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def send_offer_submitted_email(offer):
    """Email de confirmation de dépôt d'offre"""
    subject = "Votre offre de stage a été soumise"
    message = f"""
Bonjour {offer.contact_name},

Votre offre de stage a bien été soumise sur Stage Connect !

Détails de l'offre :
- Titre : {offer.title}
- Entreprise : {offer.organisme}
- Date de dépôt : {offer.date_depot.strftime('%d/%m/%Y à %H:%M')}

Votre offre est actuellement en attente de validation par nos responsables.
Vous recevrez un email dès qu'elle sera validée.

Cordialement,
L'équipe Stage Connect
"""
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [offer.contact_email],
        fail_silently=False,
    )


def send_offer_validated_email(offer):
    """Email de validation d'offre"""
    subject = "Votre offre de stage a été validée ✅"
    message = f"""
Bonjour {offer.contact_name},

Bonne nouvelle ! Votre offre de stage a été validée et est maintenant visible par les étudiants.

Détails de l'offre :
- Titre : {offer.title}
- Entreprise : {offer.organisme}

Les étudiants peuvent maintenant candidater à votre offre.
Vous recevrez un email à chaque nouvelle candidature.

Cordialement,
L'équipe Stage Connect
"""
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [offer.contact_email],
        fail_silently=False,
    )


def send_offer_refused_email(offer):
    """Email de refus d'offre"""
    subject = "Votre offre de stage n'a pas été validée"
    message = f"""
Bonjour {offer.contact_name},

Nous vous informons que votre offre de stage n'a pas été validée.

Détails de l'offre :
- Titre : {offer.title}
- Entreprise : {offer.organisme}

Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus d'informations,
n'hésitez pas à nous contacter.

Cordialement,
L'équipe Stage Connect
"""
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [offer.contact_email],
        fail_silently=False,
    )


def send_application_confirmation_email(candidature):
    """Email de confirmation de candidature pour l'étudiant"""
    subject = "Confirmation de votre candidature"
    student = candidature.student
    offer = candidature.offer
    
    message = f"""
Bonjour {student.username},

Votre candidature a bien été enregistrée !

Détails :
- Offre : {offer.title}
- Entreprise : {offer.organisme}
- Date de candidature : {candidature.date_candidature.strftime('%d/%m/%Y à %H:%M')}

L'entreprise a été notifiée de votre candidature.
Vous recevrez un email dès que l'entreprise donnera une réponse.

Cordialement,
L'équipe Stage Connect
"""
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [student.email],
        fail_silently=False,
    )


def send_new_application_to_company_email(candidature):
    """Email de notification de nouvelle candidature pour l'entreprise"""
    offer = candidature.offer
    student = candidature.student
    
    subject = f"Nouvelle candidature pour : {offer.title}"
    message = f"""
Bonjour {offer.contact_name},

Vous avez reçu une nouvelle candidature pour votre offre de stage !

Offre concernée : {offer.title}

Candidat :
- Nom d'utilisateur : {student.username}
- Email : {student.email}

Détails du profil :
"""
    
    # Ajouter les infos du profil si disponibles
    if hasattr(student, 'studentprofile'):
        profile = student.studentprofile
        if profile.phone:
            message += f"- Téléphone : {profile.phone}\n"
        if profile.bio:
            message += f"- Présentation : {profile.bio[:200]}...\n"
        if profile.cv:
            message += f"- CV : Disponible sur la plateforme\n"
    
    message += f"""

Nombre total de candidatures pour cette offre : {offer.candidature_set.count()}

Connectez-vous à la plateforme pour voir les détails complets.

Cordialement,
L'équipe Stage Connect
"""
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [offer.contact_email],
        fail_silently=False,
    )


def send_application_status_email(candidature):
    """Email de changement de statut de candidature"""
    student = candidature.student
    offer = candidature.offer
    
    if candidature.status == "Acceptée":
        subject = "✅ Votre candidature a été acceptée !"
        message = f"""
Bonjour {student.username},

Excellente nouvelle ! Votre candidature a été acceptée !

Offre : {offer.title}
Entreprise : {offer.organisme}

L'entreprise vous contactera prochainement pour la suite du processus.
Contact : {offer.contact_email}

Félicitations !

Cordialement,
L'équipe Stage Connect
"""
    elif candidature.status == "Refusée":
        subject = "Réponse à votre candidature"
        message = f"""
Bonjour {student.username},

Nous vous informons que votre candidature n'a malheureusement pas été retenue.

Offre : {offer.title}
Entreprise : {offer.organisme}

Ne vous découragez pas ! D'autres opportunités sont disponibles sur la plateforme.

Cordialement,
L'équipe Stage Connect
"""
    else:
        return  # Pas d'email pour "En attente"
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [student.email],
        fail_silently=False,
    )


def send_offer_closed_email(offer):
    """Email quand une offre est clôturée"""
    subject = f"Offre clôturée : {offer.title}"
    message = f"""
Bonjour {offer.contact_name},

Votre offre de stage a été clôturée (5 candidatures reçues).

Offre : {offer.title}
Entreprise : {offer.organisme}
Nombre de candidatures : {offer.candidature_set.count()}

Vous pouvez maintenant consulter toutes les candidatures reçues et faire votre choix.

Connectez-vous à la plateforme pour gérer vos candidatures.

Cordialement,
L'équipe Stage Connect
"""
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [offer.contact_email],
        fail_silently=False,
    )
