// ============================================================
// Jenkins Pipeline: Playwright Tests with Docker
// ============================================================
// Pre-requisites:
//   - Docker installed and running on Jenkins agent
//   - Docker Pipeline plugin properly installed
//   - HTML Publisher plugin for report viewing
// ============================================================

pipeline {
    agent none

    environment {
        CI = 'true'
    }

    stages {
        stage('Playwright Tests') {
            agent {
                dockerContainer {
                    image 'mcr.microsoft.com/playwright:v1.49.0-noble'
                    args '--ipc=host'
                }
            }
            steps {
                stage('Checkout') {
                    checkout scm
                }

                stage('Install Dependencies') {
                    sh 'npm install'
                }

                stage('Run Smoke Tests') {
                    sh 'npx playwright test --grep @smoke'
                }

                stage('Run Full Test Suite') {
                    sh 'npx playwright test'
                }
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
