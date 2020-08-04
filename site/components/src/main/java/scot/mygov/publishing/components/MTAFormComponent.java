package scot.mygov.publishing.components;

import org.hippoecm.hst.content.beans.standard.HippoBean;
import org.hippoecm.hst.core.component.HstRequest;
import org.hippoecm.hst.core.component.HstResponse;
import org.hippoecm.hst.core.linking.HstLink;
import org.hippoecm.hst.core.linking.HstLinkCreator;

/**
 * Component used to back MTA form page.
 */

public class MTAFormComponent extends CategoryComponent {

    static Redirector redirector = new Redirector();

    @Override
    public void doBeforeRender(HstRequest request, HstResponse response) {
        super.doBeforeRender(request, response);
        setFormAttributes(request, response);
    }

    static void setFormAttributes(HstRequest request, HstResponse response) {
        if (!hasContentBean(request)) {
            return;
        }

        // if this is not the canonical url then redirect to that url
        String canonicalUrl = canonicalUrl(request);
        if (!canonicalUrl.equals(request.getPathInfo())) {
            redirector.sendPermanentRedirect(request, response, canonicalUrl);
            return;
        }

        doSetFormAttributes(request);
    }

    static void doSetFormAttributes(HstRequest request) {
        HippoBean document = getDocumentBean(request);
        request.setAttribute("document", document);
    }

    // TODO: move these?  used here and in guide page but seem more like utility code.
    static String canonicalUrl(HstRequest request ) {
        HippoBean document = request.getRequestContext().getContentBean();
        return canonicalUrl(request, document);
    }

    static String canonicalUrl(HstRequest request, HippoBean document) {
        HstLinkCreator linkCreator = request.getRequestContext().getHstLinkCreator();
        HstLink redirectTolink = linkCreator.create(document, request.getRequestContext());
        return "/" + redirectTolink.getPath();
    }

}
