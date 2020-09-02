package scot.mygov.publishing.components;

import org.hippoecm.hst.content.beans.standard.HippoBean;
import org.hippoecm.hst.content.beans.standard.HippoFolderBean;
import org.hippoecm.hst.core.component.HstRequest;
import org.hippoecm.hst.core.component.HstResponse;
import org.onehippo.cms7.essentials.components.CommonComponent;

import java.util.List;

import static java.util.stream.Collectors.toList;

public class FooterComponent extends CommonComponent  {

    @Override
    public void doBeforeRender(HstRequest request, HstResponse response) {
        super.doBeforeRender(request, response);
        HippoBean baseBean = request.getRequestContext().getSiteContentBaseBean();
        HippoFolderBean footer = baseBean.getBean("site-furniture/footer/");
        request.setAttribute("children", getChildren(footer, baseBean));
    }

    List<HippoBean> getChildren(HippoFolderBean folder, HippoBean baseBean) {
        return CategoryComponent.getWrappedChildren(folder, baseBean)
                .stream().map(CategoryComponent.Wrapper::getBean).collect(toList());
    }
}
