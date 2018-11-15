export class AppLauncher {
  public static getReactDomConfig(): IReactDomConfig {
    const allScripts = document.getElementsByTagName('script');
    const currScript = allScripts[allScripts.length - 1];
    const root = document.createElement('div');
    const rootId = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 5);
    root.setAttribute('id', rootId);
    currScript.parentNode.appendChild(root);

    let env = {
      nonce: currScript.getAttribute('data-nonce'),
      wpAjaxAdminUrl: currScript.getAttribute('data-wpajaxadminurl'),
      props: currScript.getAttribute('data-props')
        ? JSON.parse(currScript.getAttribute('data-props'))
        : {}
    };

    return {
      rootId,
      env
    };
  }
}

export interface IReactDomConfig {
  rootId: string;
  env: any;
}
