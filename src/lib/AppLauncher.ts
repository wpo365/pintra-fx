export class AppLauncher {
  public static getReactDomConfig(): IReactDomConfig {
    const allScripts = document.getElementsByTagName('script')
    const currScript = allScripts[allScripts.length - 1]

    // Determine script context current URL
    const currScriptSrc = currScript.getAttribute('src')
    let scriptContextUrl = ''

    if (!!currScriptSrc) {
      scriptContextUrl = `${currScriptSrc.substr(0, currScriptSrc.lastIndexOf('/') + 1)}`
    }

    const root = document.createElement('div')
    const rootId = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .slice(0, 5)
    root.setAttribute('id', rootId)
    root.classList.add('wpo365-app-root')
    currScript.parentNode.appendChild(root)

    let env = {
      nonce: currScript.getAttribute('data-nonce'),
      wpAjaxAdminUrl: currScript.getAttribute('data-wpajaxadminurl'),
      scriptContextUrl,
      props: currScript.getAttribute('data-props')
        ? JSON.parse(currScript.getAttribute('data-props'))
        : {}
    }

    return {
      rootId,
      env
    }
  }
}

export interface IReactDomConfig {
  rootId: string
  env: any
}
