import * as core from '@actions/core'
import * as apiClient from './api-client'
import * as tarHelper from './tar-helper'
import * as github from '@actions/github'

export async function run(): Promise<void> {
  try {
    const repository: string = process.env.GITHUB_REPOSITORY || ''
    if (repository === '') {
      core.setFailed(`Could not find Repository!`)
      return
    }
    if (github.context.eventName !== 'release') {
      core.setFailed('Please ensure you have the workflow trigger as release.')
      return
    }

    const path: string = core.getInput('path')
    const tarBallCreated = await tarHelper.createTarBall(path)
    const semver: string = github.context.payload.release.tag_name

    if (tarBallCreated) {
      await apiClient.publishOciArtifact(repository, semver)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
