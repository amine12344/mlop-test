pipeline {
  agent any

  environment {
    REGISTRY = 'ghcr.io'
    IMAGE_API = 'ghcr.io/amine12344/mlop-test-api'
    IMAGE_FRONTEND = 'ghcr.io/amine12344/mlop-test-frontend'
    VERSION = "v1.0.${BUILD_NUMBER}.jenkis"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Images') {
      steps {
        sh "docker build -t ${IMAGE_API}:${VERSION} ./app"
        sh "docker build -t ${IMAGE_FRONTEND}:${VERSION} ./frontend"
      }
    }

    stage('Login to GHCR') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'ghcr-creds', usernameVariable: 'GH_USER', passwordVariable: 'GH_PAT')]) {
          sh 'echo "$GH_PAT" | docker login ghcr.io -u "$GH_USER" --password-stdin'
        }
      }
    }

    stage('Push Images') {
      steps {
        sh "docker push ${IMAGE_API}:${VERSION}"
        sh "docker push ${IMAGE_FRONTEND}:${VERSION}"
      }
    }
  }
}