package scot.gov.migration;

import org.onehippo.forge.content.exim.core.DocumentManager;
import org.onehippo.forge.content.exim.core.impl.WorkflowDocumentManagerImpl;
import org.onehippo.forge.content.exim.core.impl.WorkflowDocumentVariantImportTask;
import org.onehippo.forge.content.pojo.model.ContentNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.Session;

/**
 * Code to update or create a ContentNode in the repo.
 */
public class DocumentUpdater {

    private static final Logger LOG = LoggerFactory.getLogger(MigrationResource.class);

    public String update(Session session, String site, String path, boolean publish, ContentNode contentNode) {
        DocumentManager documentManager = new WorkflowDocumentManagerImpl(session);
        WorkflowDocumentVariantImportTask importTask = new WorkflowDocumentVariantImportTask(documentManager);
        String location = String.format("/content/documents/%s/%s/%s", site, path, contentNode.getName());
        String updatedDocumentLocation = importTask.createOrUpdateDocumentFromVariantContentNode(
                contentNode,
                contentNode.getPrimaryType(),
                location,
                "en",
                localizedName(contentNode));
        publish(documentManager, publish, updatedDocumentLocation);
        LOG.info("update {}, {}, {}", site, path, contentNode.getName());
        return updatedDocumentLocation;
    }

    static void publish(DocumentManager documentManager, boolean publish, String location) {
        if (publish) {
            documentManager.publishDocument(location);
        }
    }

    static String localizedName(ContentNode contentNode) {
        return contentNode.hasProperty("hippo:name")
                ? contentNode.getProperty("hippo:name").getValue()
                : contentNode.getName();
    }
}
