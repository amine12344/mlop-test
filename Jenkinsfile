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

    stage('Build images') {
      steps {
        sh '''
          set -eux
          docker build -t ${API_IMAGE}:${VERSION}_withjenkins ./app
          docker build -t ${FRONTEND_IMAGE}:${VERSION}_withjenkins ./frontend
        '''
      }
    }

    stage('Login to GHCR') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'ghcr-creds', usernameVariable: 'GH_USER', passwordVariable: 'GH_PAT')]) {
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
          yq -i '.api.image.tag = strenv(VERSION)' helm/mlop-test/values.yaml
          yq -i '.frontend.image.tag = strenv(VERSION)' helm/mlop-test/values.yaml
        '''
      }
    }
  }
}