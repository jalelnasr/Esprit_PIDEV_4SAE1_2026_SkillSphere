# Script PowerShell pour créer des données de test
# Gestion des Candidatures B2B

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRÉATION DES DONNÉES DE TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8083/api/b2b"

# Fonction pour faire une requête POST
function Invoke-ApiPost {
    param (
        [string]$Endpoint,
        [hashtable]$Data,
        [string]$Description
    )
    
    Write-Host "➤ $Description..." -ForegroundColor Yellow
    
    try {
        $json = $Data | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method Post -Body $json -ContentType "application/json"
        Write-Host "  ✅ Succès!" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "  ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "Vérification du backend..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8083/actuator/health" -ErrorAction Stop
    Write-Host "✅ Backend accessible sur port 8083" -ForegroundColor Green
}
catch {
    Write-Host "❌ Backend non accessible. Assurez-vous qu'il est démarré:" -ForegroundColor Red
    Write-Host "   cd B2BModule" -ForegroundColor Yellow
    Write-Host "   mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRÉATION DES ENTREPRISES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$companies = @(
    @{
        name = "TechCorp Solutions"
        email = "contact@techcorp.com"
        siret = "12345678901234"
        sector = "IT & Software"
        address = "123 Avenue des Champs-Élysées, Paris"
        phone = "0123456789"
        createdBy = 1
    },
    @{
        name = "DataPro Analytics"
        email = "info@datapro.com"
        siret = "98765432109876"
        sector = "Data Science"
        address = "45 Rue de la République, Lyon"
        phone = "0456789123"
        createdBy = 1
    },
    @{
        name = "WebDesign Studio"
        email = "hello@webdesign.com"
        siret = "55555555555555"
        sector = "Design & Marketing"
        address = "78 Boulevard Saint-Germain, Paris"
        phone = "0198765432"
        createdBy = 1
    }
)

$companyIds = @()
foreach ($company in $companies) {
    $result = Invoke-ApiPost -Endpoint "/companies" -Data $company -Description "Création de $($company.name)"
    if ($result) {
        $companyIds += $result.id
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRÉATION DES OFFRES D'EMPLOI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$jobs = @(
    @{
        companyId = 1
        title = "Développeur Full Stack Senior"
        description = "Nous recherchons un développeur expérimenté en Java/Spring et Angular pour rejoindre notre équipe dynamique."
        contractType = "CDI"
        location = "Paris (Hybride)"
        requiredSkills = @("Java", "Spring Boot", "Angular", "MySQL", "Docker")
    },
    @{
        companyId = 1
        title = "DevOps Engineer"
        description = "Rejoignez notre équipe infrastructure pour gérer nos pipelines CI/CD et notre infrastructure cloud."
        contractType = "CDI"
        location = "Paris"
        requiredSkills = @("Kubernetes", "Docker", "AWS", "Jenkins", "Terraform")
    },
    @{
        companyId = 2
        title = "Data Scientist"
        description = "Analysez des données complexes et créez des modèles prédictifs pour nos clients."
        contractType = "CDI"
        location = "Lyon (Remote possible)"
        requiredSkills = @("Python", "Machine Learning", "TensorFlow", "SQL", "Statistics")
    },
    @{
        companyId = 2
        title = "Data Engineer"
        description = "Construisez et maintenez nos pipelines de données à grande échelle."
        contractType = "CDD"
        location = "Lyon"
        requiredSkills = @("Python", "Spark", "Kafka", "Airflow", "SQL")
    },
    @{
        companyId = 3
        title = "UI/UX Designer"
        description = "Créez des expériences utilisateur exceptionnelles pour nos clients."
        contractType = "Freelance"
        location = "Paris (Remote)"
        requiredSkills = @("Figma", "Adobe XD", "Sketch", "Prototyping", "User Research")
    }
)

$jobIds = @()
foreach ($job in $jobs) {
    $result = Invoke-ApiPost -Endpoint "/job-offers" -Data $job -Description "Création de l'offre: $($job.title)"
    if ($result) {
        $jobIds += $result.id
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRÉATION DES CANDIDATS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$candidates = @(
    @{
        id = 101
        title = "Jean Dupont"
        skills = @("Java", "Spring Boot", "Angular", "MySQL")
        experienceYears = 5
        resumeUrl = "https://example.com/cv/jean-dupont.pdf"
        isLookingForJob = $true
    },
    @{
        id = 102
        title = "Marie Martin"
        skills = @("Python", "Machine Learning", "TensorFlow", "SQL")
        experienceYears = 3
        resumeUrl = "https://example.com/cv/marie-martin.pdf"
        isLookingForJob = $true
    },
    @{
        id = 103
        title = "Pierre Dubois"
        skills = @("Kubernetes", "Docker", "AWS", "Jenkins")
        experienceYears = 7
        resumeUrl = "https://example.com/cv/pierre-dubois.pdf"
        isLookingForJob = $true
    },
    @{
        id = 104
        title = "Sophie Bernard"
        skills = @("Figma", "Adobe XD", "Prototyping", "User Research")
        experienceYears = 4
        resumeUrl = "https://example.com/cv/sophie-bernard.pdf"
        isLookingForJob = $true
    },
    @{
        id = 105
        title = "Luc Petit"
        skills = @("Python", "Spark", "Kafka", "SQL")
        experienceYears = 6
        resumeUrl = "https://example.com/cv/luc-petit.pdf"
        isLookingForJob = $true
    },
    @{
        id = 106
        title = "Emma Rousseau"
        skills = @("Java", "Spring", "React", "PostgreSQL")
        experienceYears = 2
        resumeUrl = "https://example.com/cv/emma-rousseau.pdf"
        isLookingForJob = $true
    }
)

foreach ($candidate in $candidates) {
    Invoke-ApiPost -Endpoint "/candidates" -Data $candidate -Description "Création du candidat: $($candidate.title)" | Out-Null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRÉATION DES CANDIDATURES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$applications = @(
    @{ jobOfferId = 1; candidateId = 101 },  # Jean -> Full Stack
    @{ jobOfferId = 1; candidateId = 106 },  # Emma -> Full Stack
    @{ jobOfferId = 2; candidateId = 103 },  # Pierre -> DevOps
    @{ jobOfferId = 3; candidateId = 102 },  # Marie -> Data Scientist
    @{ jobOfferId = 4; candidateId = 105 },  # Luc -> Data Engineer
    @{ jobOfferId = 5; candidateId = 104 },  # Sophie -> UI/UX Designer
    @{ jobOfferId = 1; candidateId = 105 },  # Luc -> Full Stack (candidature multiple)
    @{ jobOfferId = 3; candidateId = 106 }   # Emma -> Data Scientist (candidature multiple)
)

foreach ($app in $applications) {
    $jobTitle = $jobs[$app.jobOfferId - 1].title
    $candidateName = ($candidates | Where-Object { $_.id -eq $app.candidateId }).title
    Invoke-ApiPost -Endpoint "/applications" -Data $app -Description "Candidature: $candidateName -> $jobTitle" | Out-Null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ DONNÉES DE TEST CRÉÉES!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Résumé:" -ForegroundColor Cyan
Write-Host "  • $($companies.Count) entreprises créées" -ForegroundColor White
Write-Host "  • $($jobs.Count) offres d'emploi créées" -ForegroundColor White
Write-Host "  • $($candidates.Count) candidats créés" -ForegroundColor White
Write-Host "  • $($applications.Count) candidatures créées" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Accéder à l'application:" -ForegroundColor Cyan
Write-Host "  http://localhost:4200/admin/b2b/applications" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Swagger UI (pour tester les APIs):" -ForegroundColor Cyan
Write-Host "  http://localhost:8083/swagger-ui.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "✨ Bon test!" -ForegroundColor Green
