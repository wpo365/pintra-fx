# Pintra-Fx | A WordPress + Office 365 Intranet Framework

## Overview

Pintra is short for a WordPress + Office 365 intranet that is built using our (partially open source) Framework **Pintra-Fx**. This framework offers a runtime model across multiple technology layers, to help developers build client-side Office 365 productive intranet experiences and apps to meet the advanced requirements of today's modern workplace.

Because **Pintra-Fx** is rooted in WordPress, it differs greatly from the [SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview). However, it also offers many similar key features, including the following:

- Full support for client-side Office 365 - e.g. SharePoint Online and Microsoft Graph - development.
- A very simple but robust client API to get access tokens for Office 365 services e.g. SharePoint Online and Microsoft Graph
- Easy integration with Office 365 data.

- It runs in the context of the current user and connection in the browser. There are no iframes for the customization (JavaScript is embedded directly to the page).
- The controls are rendered in the normal page DOM.
- It is framework-agnostic (but in fairness it is biased towards React at the moment).
- The toolchain is based on common open source client development tools such as npm, TypeScript and webpack.
- Performance is reliable.
- Authors can use their (Pintra-Fx) client-side solutions on all (WordPress) pages and post.

The runtime model uses a standardized WordPress shortcode to inject a client-side JavaScript solution into any WordPress page or post. The shortcode merely acts as a wrapper for this solution and is easy to configure. Think of this shortcode as SharePoint's Script Editor WebPart that was used to inject custom JavaScript into a SharePoint page.

To develop your own client-solution, the runtime model includes a very simple but robust client-side API (available as [NPM package](https://www.npmjs.com/package/pintra-fx)) to get access tokens for Office 365 services e.g. SharePoint Online and Microsoft Graph and store them in the browser's local storage until expired. When expired, the API will use the server-side stored refresh token to get a fresh new access token.

To be able to request access tokens, the runtime expects that WordPress authentication has been delegated to Microsoft's Azure AD and that you have one of the following plugins installed, activated and configured:

[WordPress + Office 365 Login](https://wordpress.org/plugins/wpo365-login/) plugin ([Premium version available](https://www.wpo365.com/downloads/wordpress-office-365-login-premium/)). It is also this plugin that provides the server-side AJAX server used by the client-side API and the shortcode used to inject your **Pintra** client-side solution into a page.

## License

The Pintra-Fx JavaScript library is licensed under ... Other components of the Pintra Framework are separately licensed. Premium versions must be acquired through the company **Downloads by Van Wieren** and are available from the [WPO365 website](https://www.wpo365.com/).

## Questions

Go to our [Support Page](https://www.wpo365.com/how-to-get-support/) to get in touch with us. We haven't been able to test our solution(s) in all endless possible WordPress configurations and versions, so we are keen to hear from you and happy to learn! Share your feedback with us on [Twitter](https://twitter.com/WPO365) and help us get better!

## Setup and prerequisites

The runtime model relies on users signing into your WordPress website with Microsoft. This way the runtime can ensure that the user has an active session that can be leveraged to request access tokens for Office 365 e.g. SharePoint Online and Microsoft Graph, on behalf of the user.

This does mean that the runtime model expects one of the following plugins to be installed, actived and properly configured:

- [WordPress + Office 365 Login (personal use)](https://wordpress.org/plugins/wpo365-login/) plugin
- [WordPress + Office 365 Login (premium)](https://www.wpo365.com/downloads/wordpress-office-365-login-premium/)

Please visit our [website](https://www.wpo365.com/) to find out more about the premium features:

- User Registration
- Single Sign-on
- User Synchronization

## Getting started

## 1. WordPress shortcode

**Pintra** client-side solutions are injected into any WordPress page or post using a **[WordPress shortcode](https://codex.wordpress.org/shortcode)**, e.g.:

```php
[pintra props="resourceId,https://wpo365demo.sharepoint.com" script_url="https://pintra-sample-app.azureedge.net/"]
```

The WordPress shortcode basically is a macro that can be used in any WordPress page or post. The _[pintra]_ shortcode takes two parameters:

| **Parameter** | **Usage**                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| props         | [Optional] Comma separated key / value pairs (concatenated by a semicolon) that are injected into the client-side solution |
| script_url    | URI that points to a script that contains your client-side solution                                                        |

When a WordPress page or post is being rendered, the shortcode macro injects the following HTML into the page (and replaces the PHP \$tags with relevant data e.g. with values from the shortcode's parameters):

```html
<!-- Dependencies -->
<script
  crossorigin
  src="https://unpkg.com/react@16/umd/react.production.min.js"
></script>

<script
  crossorigin
  src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"
></script>

<!-- Main -->
<script
  src="<?php echo $script_url ?>"
  data-nonce="<?php echo wp_create_nonce( 'pintra_fx_nonce' ) ?>"
  data-wpajaxadminurl="<?php echo admin_url() . '/admin-ajax.php' ?>"
  data-props="<?php echo htmlspecialchars( $props ) ?>"
></script>
```

### 2. Pintra API - AppLauncher

You can see from the previous code snippet that first _react@16_ and _react-dom@16_ is injected into the page and then the custom client-side solution is being loaded from the _script_url_ shortcode's parameter. This way a WordPress page or post author can use the shortcode to insert any client-side app into the page or post; no special knowledge required!

For the shortcode to be able to pass data to the client-side solution, HTML5 data attributes are used. When you keep reading, you'll find a bit further down that the **Pintra** API's **AppLauncher** class offers an helper method _getReactDomConfig_ that will read those attributes and make them available to the client-side solution when it initializes, as follows:

```javascript
import React = require('react')
import ReactDOM = require('react-dom')

import { PintraSampleApp } from './components/PintraSampleApp'

import {
  IReactDomConfig,
  AppLauncher,
} from 'pintra-fx'

const reactDomConfig: IReactDomConfig = AppLauncher.getReactDomConfig()

ReactDOM.render(
  <PintraSampleApp env={reactDomConfig.env} />,
  document.getElementById(reactDomConfig.rootId)
)
```

In this example the client-solution renders an ordinary react component called _PintraSampleApp_. However, the client-side solution has no knowledge of the WordPress page or post and therefore does not know what HTML element will be its root element. The **Pintra** API helps with some black magic when calling _AppLauncher.getReactDomConfig()_:

```javascript
/*
interface IReactDomConfig {
    rootId: string;
    env: any;
}
*/

const reactDomConfig: IReactDomConfig = AppLauncher.getReactDomConfig();
```

Calling _AppLauncher.getReactDomConfig()_ will locate the executing script in the DOM and adds a new DIV element as a child to the parent of that SCRIPT element. It will also assign a random ID to it and return this ID as the _rootId_ property of the object it returns. This way, the same client-side solution can be added to any page or post multiple times, without the problem of multiple DOM elements having the same ID.

Additionally, the me will read the aforementioned attributes from the excuting script's DOM element and return them in the form of the _env_ property.

In the current example _PintraSampleApp_ is an ordinary react component that expects one property, namely _env_ (where _env_ is _IReactDomConfig.env_ transparently passed down).

Especially worth mentioning is the shortcode's _props_ parameter that is converted to a JSON object by the API. The _props_ parameter can hold settings and configuration data that is very specific to the client-side solution but that may not be available at build time e.g. the resource-id of your SharePoint Online tenant. So in case of the sample app, the _IReactDomConfig.env_ property may look as follows:

```javascript
{
  nonce: '000c119b56';
  props: {
    resourceId: 'https://wpo365demo.sharepoint.com';
  }
  wpAjaxAdminUrl: 'http://www.example.com/wp-admin/admin-ajax.php';
}
```

### 3. Pintra API - TokenCache

The real power of the **Pintra** Framework does not lie in the fact that it helps crossing bridges from WordPress Authoring (shortcode) into WordPress programming (PHP) into the client-side universum (JavaScript). Sure, it's a nice feature and probably it's useful to enable WordPress authors to parameterize client-side solutions as they see fit. However, to build amazing intranet experiences based on Office 365 e.g. SharePoint Online and Microsoft Graph, it's vital that the client-side solution can obtain access tokens on behalf of the current user.
Obviously there are existing client-side technologies to achieve this e.g. ADAL.JS, but developers with experience in this field will know that end users more often than not are confronted with annoying popup screens for authentication, slowly loading iframes that are injected in the page or specifically in Internet Explorer or Microsoft Edge with security zone issues.

The **Pintra** Framework relies on authentication to Office 365 (Azure AD) being handled by the [WordPress + Office 365 Login](https://wordpress.org/plugins/wpo365-login/) plugin ([Premium version available](https://www.wpo365.com/downloads/wordpress-office-365-login-premium/)). Therefore you must have this plugin installed, activated and successfully configured before you can build your first Office 365 e.g. SharePoint Online or Microsoft Graph client-side app. The plugin will provide a WordPress AJAX service that is consumed by the **Pintra** API's **TokenCache** class.

The _TokenCache_ class offers a simple API to developers of client-side solutions to get access tokens for Office 365 services e.g. SharePoint Online and Microsoft Graph, on behalf of an end users. It will subsequently store those tokens in the browser's local storage until expired. When expired, the API will use the server-side stored refresh token to get a fresh new access token. The following example illustrates this:

```javascript
public render(): React.ReactElement<IPintraSampleAppProps> {
  return (
    <div>
      <button onClick={this._click}>Get SharePoint Token</button>
    </div>
  )
}

private _click = () => {
  TokenCache.getToken(
    new TokenRequest('sharepoint', this.props.env.props.resourceId),
    {
      nonce: this.props.env.nonce,
      wpAjaxAdminUrl: this.props.env.wpAjaxAdminUrl,
    }
  ).then(
    tokenResponse => console.log(tokenResponse),
    errorResponse => {
      if (errorResponse instanceof TokenRequestError) {
        console.log(errorResponse.data)
      }
    }
  )
}
```

And if getting a token was successful, the TokenResponse contain the information requested:

```javascript
{
  name: "sharepoint",
  expires: 1541369643000,
  bearer: "eyJ0eXAiOi..."
}
```

Whether or not this token was retrieved from the local browser cache or needed to be refreshed and therefore is a new token that was requested asynchronously from the WordPress AJAX service is decided by the API. In other words: as a developer of a client-side solution you may assume the TokenResponse always to contain a valid token. The client-side **Pintra** API will manage the validity and expiration.

In case the API cannot produce a valid token it will return a TokenRequestError with error information and codes that you as a developer must process e.g. when the user is required to interactively re-authenticate when the active session has expired.

### Build your first Microsoft Graph client-side app using the Pintra Framework

#### 1. Create a new project directory in your favorite location

```cmd
md used-documents-app
```

#### 2. Go to the project directory

```cmd
cd used-documents-app
```



#### 99. Deploy your solution

You don't even need to install your client-side solution on your WordPress server but instead can deploy it for example to Azure blog storage or any (secure) CDN. A Universal App only needs to know from where to download your client-side solution and this client-side solution must include the [WPO365Fx JavaScript library](https://github.com/wpo365/wpo365-fxlib) that provides a simple but robust API to request access tokens for Office 365 services e.g. SharePoint Online or Microsoft Graph. To simplify your development you can add this library to your own project in the form of an [NPM package](https://www.npmjs.com/package/wpo365-fxlib).
