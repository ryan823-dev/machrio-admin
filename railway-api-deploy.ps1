# Railway Direct Deployment using API
# Usage: .\railway-api-deploy.ps1 -Token "your-railway-token" -ProjectId "your-project-id"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectId
)

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "Railway Direct Deployment"
Write-Host "========================================"
Write-Host ""

# GraphQL endpoint
$endpoint = "https://backboard.railway.app/graphql"

# Headers
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $Token"
}

# Get project info if not provided
if ([string]::IsNullOrEmpty($ProjectId)) {
    Write-Host "Fetching projects..."
    $projectsQuery = @{
        query = "query Projects { projects { id name } }"
    } | ConvertTo-Json
    
    try {
        $projectsResponse = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $projectsQuery
        if ($projectsResponse.data.projects.Count -gt 0) {
            $project = $projectsResponse.data.projects[0]
            $ProjectId = $project.id
            Write-Host "Using project: $($project.name) ($ProjectId)"
        } else {
            Write-Host "No projects found!"
            exit 1
        }
    } catch {
        Write-Host "Error fetching projects: $_"
        exit 1
    }
}

# Trigger deployment
Write-Host ""
Write-Host "Triggering deployment for project: $ProjectId"

$deployQuery = @{
    query = "mutation DeploymentDeploy(`$projectId: String!, `$environment: String!) { deploymentDeploy(projectId: `$projectId, environment: `$environment) { id status } }"
    variables = @{
        projectId = $ProjectId
        environment = "production"
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $deployQuery
    
    if ($response.data) {
        Write-Host "Deployment triggered successfully!"
        Write-Host "Deployment ID: $($response.data.deploymentDeploy.id)"
        Write-Host "Status: $($response.data.deploymentDeploy.status)"
        Write-Host ""
        Write-Host "View deployment: https://railway.app/dashboard"
    } else {
        Write-Host "Error: $($response.errors | ConvertTo-Json)"
        exit 1
    }
} catch {
    Write-Host "Error triggering deployment: $_"
    exit 1
}
