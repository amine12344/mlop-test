pipeline {
  agent { label 'wsl-docker' }

  environment {
    API_IMAGE = 'ghcr.io/amine12344/mlop-test-api'
    FRONTEND_IMAGE = 'ghcr.io/amine12344/mlop-test-frontend'
    DEPLOY_BRANCH = 'feature/test-argo'
    VERSION = "sha-${GIT_COMMIT}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    // stage('Skip CI check') {
    //   steps {
    //     script {
    //       def msg = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
    //       echo "Last commit message: ${msg}"
    //       if (msg.contains('[skip ci]')) {
    //         currentBuild.result = 'NOT_BUILT'
    //         error('Skipping build because commit message contains [skip ci]')
    //       }
    //     }
    //   }
    // }

    stage('Verify Docker') {
      steps {
        sh '''
          set -eux
          docker version
        '''
      }
    }

     stage('API Smoke Tests') {
      steps {
        sh '''
          set -eux
          cd app
          npm install
          npm test
        '''
      }
    }

    stage('Frontend Static Tests') {
      steps {
        sh '''
          set -eux
          ./frontend/test-frontend.sh
        '''
      }
    }

    stage('Build images') {
      steps {
        sh '''
          set -eux
          docker build -t ${API_IMAGE}:${VERSION}_withjenkins ./app
          docker build -t ${FRONTEND_IMAGE}:${VERSION}_withjenkins ./frontend
        '''
      }
    }

     stage('Container Smoke Tests') {
      steps {
        sh '''
          set -eux

          docker network create mlop-test-net || true
          docker rm -f test-api test-frontend >/dev/null 2>&1 || true

          docker run -d --name test-api --network mlop-test-net \
            -e PORT=8080 \
            -e DB_HOST=postgres \
            -e DB_PORT=5432 \
            -e DB_NAME=postgres \
            -e DB_USER=postgres \
            -e DB_PASSWORD=postgres \
            -e APP_VERSION=test-ci \
            -p 18080:8080 \
            ${API_IMAGE}:${VERSION}${TAG_SUFFIX}

          sleep 4
          curl -fsS http://localhost:18080/healthz
          curl -fsS http://localhost:18080/readyz
          curl -fsS http://localhost:18080/ | grep version

          docker run -d --name test-frontend \
            -p 18081:80 \
            ${FRONTEND_IMAGE}:${VERSION}${TAG_SUFFIX}

          sleep 3
          curl -fsS http://localhost:18081/ | grep '<title>'
          curl -fsS http://localhost:18081/app.js | grep 'loadStatus'

          docker rm -f test-api test-frontend
        '''
      }
    }


    stage('Login to GHCR') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'ghrc-creds', usernameVariable: 'GH_USER', passwordVariable: 'GH_PAT')]) {
          sh '''
            echo "$GH_PAT" | docker login ghcr.io -u "$GH_USER" --password-stdin
          '''
        }
      }
    }

    stage('Push images') {
      steps {
        sh '''
          docker push ${API_IMAGE}:${VERSION}_withjenkins
          docker push ${FRONTEND_IMAGE}:${VERSION}_withjenkins
        '''
      }
    }

    stage('Update Helm values') {
      steps {
        sh '''
          yq -i '.api.image.tag = strenv(VERSION)+"_withjenkins"' helm/mlop-test/values.yaml
          yq -i '.frontend.image.tag = strenv(VERSION)+"_withjenkins"' helm/mlop-test/values.yaml
        '''
      }
    }
  }
}