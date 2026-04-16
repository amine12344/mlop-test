pipeline {
  agent none

  environment {
    API_IMAGE = 'ghcr.io/amine12344/mlop-test-api'
    FRONTEND_IMAGE = 'ghcr.io/amine12344/mlop-test-frontend'
    DEPLOY_BRANCH = 'feature/test-argo'
    VERSION = "sha-${GIT_COMMIT}"
  }

  stages {
    stage('Checkout') {
      agent { label 'wsl-docker' }
      steps {
        checkout scm
      }
    }

    stage('Skip CI check') {
      agent { label 'wsl-docker' }
      steps {
        script {
          def msg = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
          echo "Last commit message: ${msg}"
          if (msg.contains('[skip ci]')) {
            currentBuild.result = 'NOT_BUILT'
            error('Skipping build because commit message contains [skip ci]')
          }
        }
      }
    }

    stage('Verify tools') {
      agent { label 'wsl-docker' }
      steps {
        sh '''
          set -eux
          docker version
          git --version
          helm version
          yq --version
        '''
      }
    }

    stage('Validate Docker builds') {
      agent { label 'wsl-docker' }
      steps {
        sh '''
          set -eux
          docker build -t local-api:${VERSION} ./app
          docker build -t local-frontend:${VERSION} ./frontend
        '''
      }
    }

    stage('Validate Helm chart') {
      agent { label 'wsl-docker' }
      steps {
        sh '''
          set -eux
          helm lint helm/mlop-test
          helm template mlop-test helm/mlop-test -n mlop-test >/tmp/rendered.yaml
          test -s /tmp/rendered.yaml
        '''
      }
    }

    stage('Login to GHCR') {
      agent { label 'wsl-docker' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'ghcr-creds', usernameVariable: 'GH_USER', passwordVariable: 'GH_PAT')]) {
          sh '''
            set -eux
            echo "$GH_PAT" | docker login ghcr.io -u "$GH_USER" --password-stdin
          '''
        }
      }
    }

    stage('Build and Push Images') {
      agent { label 'wsl-docker' }
      steps {
        sh '''
          set -eux
          docker build -t ${API_IMAGE}:${VERSION} -t ${API_IMAGE}:latest ./app
          docker build -t ${FRONTEND_IMAGE}:${VERSION} -t ${FRONTEND_IMAGE}:latest ./frontend
          docker push ${API_IMAGE}:${VERSION}
          docker push ${API_IMAGE}:latest
          docker push ${FRONTEND_IMAGE}:${VERSION}
          docker push ${FRONTEND_IMAGE}:latest
        '''
      }
    }

    stage('Update Helm values') {
      agent { label 'wsl-docker' }
      steps {
        sh '''
          set -eux
          yq -i '.api.image.repository = strenv(API_IMAGE)' helm/mlop-test/values.yaml
          yq -i '.api.image.tag = strenv(VERSION)' helm/mlop-test/values.yaml
          yq -i '.api.env.APP_VERSION = strenv(VERSION)' helm/mlop-test/values.yaml

          yq -i '.frontend.image.repository = strenv(FRONTEND_IMAGE)' helm/mlop-test/values.yaml
          yq -i '.frontend.image.tag = strenv(VERSION)' helm/mlop-test/values.yaml
          yq -i '.frontend.env.FRONTEND_VERSION = strenv(VERSION)' helm/mlop-test/values.yaml
        '''
      }
    }

    stage('Commit GitOps change') {
      agent { label 'wsl-docker' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'git-creds', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PAT')]) {
          sh '''
            set -eux
            git config user.name "jenkins"
            git config user.email "jenkins@local"
            git checkout ${DEPLOY_BRANCH}
            git add helm/mlop-test/values.yaml
            git diff --cached --quiet && exit 0
            git commit -m "gitops: deploy ${VERSION} [skip ci]"
            git remote set-url origin https://${GIT_USER}:${GIT_PAT}@github.com/amine12344/mlop-test.git
            git push origin ${DEPLOY_BRANCH}
          '''
        }
      }
    }
  }
}