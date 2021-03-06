package scot.mygov.publishing.beans;

import org.hippoecm.hst.content.beans.Node;
import org.hippoecm.hst.content.beans.standard.HippoResourceBean;
import org.onehippo.cms7.essentials.dashboard.annotations.HippoEssentialsGenerated;

import java.util.List;

@HippoEssentialsGenerated(internalName = "publishing:document")
@Node(jcrType = "publishing:document")
public class Document extends BaseDocument {

    @HippoEssentialsGenerated(internalName = "govscot:document")
    public HippoResourceBean getDocument() {
        return getBean("publishing:document", HippoResourceBean.class);
    }

    @HippoEssentialsGenerated(internalName = "publishing:thumbnails")
    public List<HippoResourceBean> getThumbnails() {
        return getChildBeansByName("publishing:thumbnails", HippoResourceBean.class);
    }

}
