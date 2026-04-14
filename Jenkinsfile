pipeline {
  agent {
    kubernetes {
      yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: tools
      image: alpine:3.20
      command:
        - sh
        - -c
        - cat
      tty: true
      volumeMounts:
        - name: docker-sock
          mountPath: /var/run/docker.sock
  volumes:
    - name: docker-sock
      hostPath:
        path: /var/run/docker.sock
'''
    }
  }

  environment {
    REGISTRY = 'ghcr.io'
    OWNER = 'YOUR_GITHUB_USERNAME'
    API_IMAGE = 'ghcr.io/YOUR_GITHUB_USERNAME/mlop-test-api'
    FRONTEND_IMAGE = 'ghcr.io/YOUR_GITHUB_USERNAME/mlop-test-frontend'
    VERSION = "v1.0.${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install tools') {
      steps {
        container('tools') {
          sh '''
            apk add --no-cache bash curl docker-cli git
            docker version || true
          '''
        }
      }
    }

    stage('Build API image') {
      steps {
        container('tools') {
          sh 'docker build -t ${API_IMAGE}:${VERSION} ./app'
        }
      }
    }

    stage('Build frontend image') {
      steps {
        container('tools') {
          sh 'docker build -t ${FRONTEND_IMAGE}:${VERSION} ./frontend'
        }
      }
    }

    stage('Login to GHCR') {
      steps {
        container('tools') {
          withCredentials([usernamePassword(credentialsId: 'ghcr-creds', usernameVariable: 'GH_USER', passwordVariable: 'GH_PAT')]) {
            sh 'echo "$GH_PAT" | docker login ghcr.io -u "$GH_USER" --password-stdin'
          }
        }
      }
    }

    stage('Push API image') {
      steps {
        container('tools') {
          sh 'docker push ${API_IMAGE}:${VERSION}'
        }
      }
    }

    stage('Push frontend image') {
      steps {
        container('tools') {
          sh 'docker push ${FRONTEND_IMAGE}:${VERSION}'
        }
      }
    }
  }

  post {
    success {
      echo "Published:"
      echo "${API_IMAGE}:${VERSION}"
      echo "${FRONTEND_IMAGE}:${VERSION}"
    }
  }
}