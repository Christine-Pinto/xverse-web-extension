import {
  AuthenticationRequestEvent,
  CreateInscriptionEvent,
  CreateRepeatInscriptionsEvent,
  DomEventName,
  GetAddressRequestEvent,
  SendBtcRequestEvent,
  SignatureRequestEvent,
  SignBatchPsbtRequestEvent,
  SignMessageRequestEvent,
  SignPsbtRequestEvent,
  TransactionRequestEvent,
} from '@common/types/inpage-types';
import {
  CONTENT_SCRIPT_PORT,
  ExternalMethods,
  ExternalSatsMethods,
  LegacyMessageFromContentScript,
  LegacyMessageToContentScript,
  MESSAGE_SOURCE,
  SatsConnectMessageFromContentScript,
} from '@common/types/message-types';
import getEventSourceWindow from '@common/utils/get-event-source-window';
import RequestsRoutes from '@common/utils/route-urls';
import { getIsPriorityWallet } from '@utils/chromeLocalStorage';

// Legacy messaging to work with older versions of Connect
window.addEventListener('message', (event) => {
  const { data } = event;
  if (data.source === 'xverse-app') {
    const { method } = data;
    if (method === 'getURL') {
      const url = chrome.runtime.getURL('options.html');
      const source = getEventSourceWindow(event);
      source?.postMessage(
        {
          url,
          method: 'getURLResponse',
          source: 'xverse-extension',
        },
        event.origin,
      );
    }
  }
});

// Connection to background script - fires onConnect event in background script
// and establishes two-way communication
let backgroundPort;
function connect() {
  backgroundPort = chrome.runtime.connect({ name: CONTENT_SCRIPT_PORT });
  backgroundPort.onDisconnect.addListener(connect);
}

connect();

// Sends message to background script that an event has fired
function sendMessageToBackground(
  message: LegacyMessageFromContentScript | SatsConnectMessageFromContentScript,
) {
  backgroundPort.postMessage(message);
}

// Receives message from background script to execute in browser
chrome.runtime.onMessage.addListener((message: LegacyMessageToContentScript) => {
  if (message.source === MESSAGE_SOURCE) {
    // Forward to web app (browser)
    window.postMessage(message, window.location.origin);
  }
});

interface ForwardDomEventToBackgroundArgs {
  payload: string;
  method: LegacyMessageFromContentScript['method'] | SatsConnectMessageFromContentScript['method'];
  urlParam: string;
  path: RequestsRoutes;
}

function forwardDomEventToBackground({ payload, method }: ForwardDomEventToBackgroundArgs) {
  sendMessageToBackground({
    method,
    payload,
    source: MESSAGE_SOURCE,
  });
}

// Listen for a CustomEvent (auth request) coming from the web app
document.addEventListener(DomEventName.authenticationRequest, ((
  event: AuthenticationRequestEvent,
) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.AuthenticationRequest,
    payload: event.detail.authenticationRequest,
    urlParam: 'authRequest',
    method: ExternalMethods.authenticationRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (transaction request) coming from the web app
document.addEventListener(DomEventName.transactionRequest, ((event: TransactionRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.TransactionRequest,
    payload: event.detail.transactionRequest,
    urlParam: 'request',
    method: ExternalMethods.transactionRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (signature request) coming from the web app
document.addEventListener(DomEventName.signatureRequest, ((event: SignatureRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SignatureRequest,
    payload: event.detail.signatureRequest,
    urlParam: 'request',
    method: ExternalMethods.signatureRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (structured data signature request) coming from the web app
document.addEventListener(DomEventName.structuredDataSignatureRequest, ((
  event: SignatureRequestEvent,
) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SignatureRequest,
    payload: event.detail.signatureRequest,
    urlParam: 'request',
    method: ExternalMethods.structuredDataSignatureRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (BTC Address request) coming from the web app
document.addEventListener(DomEventName.getAddressRequest, ((event: GetAddressRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.AddressRequest,
    payload: event.detail.btcAddressRequest,
    urlParam: 'addressRequest',
    method: ExternalSatsMethods.getAddressRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (PSBT Signing request) coming from the web app
document.addEventListener(DomEventName.signPsbtRequest, ((event: SignPsbtRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SignBtcTx,
    payload: event.detail.signPsbtRequest,
    urlParam: 'signPsbtRequest',
    method: ExternalSatsMethods.signPsbtRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (Batch PSBT Signing request) coming from the web app
document.addEventListener(DomEventName.signBatchPsbtRequest, ((
  event: SignBatchPsbtRequestEvent,
) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SignBatchBtcTx,
    payload: event.detail.signBatchPsbtRequest,
    urlParam: 'signBatchPsbtRequest',
    method: ExternalSatsMethods.signBatchPsbtRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (Message Signing request) coming from the web app
document.addEventListener(DomEventName.signMessageRequest, ((event: SignMessageRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SignatureRequest,
    payload: event.detail.signMessageRequest,
    urlParam: 'signMessageRequest',
    method: ExternalSatsMethods.signMessageRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (Send BTC request) coming from the web app
document.addEventListener(DomEventName.sendBtcRequest, ((event: SendBtcRequestEvent) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.SendBtcTx,
    payload: event.detail.sendBtcRequest,
    urlParam: 'sendBtcRequest',
    method: ExternalSatsMethods.sendBtcRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (Create Text Inscription Request) coming from the web app
document.addEventListener(DomEventName.createInscriptionRequest, ((
  event: CreateInscriptionEvent,
) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.CreateInscription,
    payload: event.detail.createInscriptionRequest,
    urlParam: 'createInscriptionRequest',
    method: ExternalSatsMethods.createInscriptionRequest,
  });
}) as EventListener);

// Listen for a CustomEvent (Create Repeat Inscriptions Request) coming from the web app
document.addEventListener(DomEventName.createRepeatInscriptionsRequest, ((
  event: CreateRepeatInscriptionsEvent,
) => {
  forwardDomEventToBackground({
    path: RequestsRoutes.CreateRepeatInscriptions,
    payload: event.detail.createRepeatInscriptionsRequest,
    urlParam: 'createRepeatInscriptionsRequest',
    method: ExternalSatsMethods.createRepeatInscriptionsRequest,
  });
}) as EventListener);

// Inject in-page script (Stacks and Bitcoin Providers)
const injectInPageScript = (isPriority) => {
  const inpage = document.createElement('script');
  inpage.src = chrome.runtime.getURL('inpage.js');
  inpage.id = 'xverse-wallet-provider';
  inpage.setAttribute('data-is-priority', isPriority ? 'true' : '');
  document.body.appendChild(inpage);
};

getIsPriorityWallet()
  .then((isPriorityWallet) => {
    injectInPageScript(isPriorityWallet);
  })
  .catch(() => {
    injectInPageScript(false);
  });
