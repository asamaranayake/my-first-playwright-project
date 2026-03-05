// ============================================================
// Jenkins Pipeline: Playwright Tests with Docker
// ============================================================
// Pre-requisites:
//   - Docker plugin installed on Jenkins
//   - HTML Publisher plugin for report viewing
// ============================================================

pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.49.0-noble'
            args '--ipc=host'  // Recommended for Chromium
        }
    }

    environment {
        CI = 'true'
        HOME = '/root'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Smoke Tests') {
            steps {
                sh 'npx playwright test --grep @smoke'
            }
        }

        stage('Run Full Test Suite') {
            steps {
                sh 'npx playwright test'
            }
        }
    }

    post {
        always {
            // Archive HTML report
            publishHTML(target: [
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])

            // Archive test artifacts
            archiveArtifacts artifacts: 'playwright-report/**', fingerprint: true
            archiveArtifacts artifacts: 'test-results/**', fingerprint: true, allowEmptyArchive: true

            // Publish JUnit results
            junit testResults: 'test-results/junit-results.xml', allowEmptyResults: true
        }
        failure {
            echo 'Playwright tests failed! Check the report for details.'
        }
        success {
            echo 'All Playwright tests passed!'
        }
    }
}
