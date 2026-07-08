package com.minigit.command;

import com.minigit.model.CommandResult;
import com.minigit.repository.Repository;
import com.minigit.service.LCSDiff;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class DiffCommand implements Command {

    private String repoId;
    private String hashA;
    private String hashB;
    private Repository repository;
    private LCSDiff diffStrategy;

    public DiffCommand(String repoId, String hashA, String hashB, Repository repository, LCSDiff diffStrategy) {
        this.repoId = repoId;
        this.hashA = hashA;
        this.hashB = hashB;
        this.repository = repository;
        this.diffStrategy = diffStrategy;
    }

    @Override
    public CommandResult execute() {
        try {
            Map<String, Object> commitA = repository.getObject(hashA, repoId);
            Map<String, Object> commitB = repository.getObject(hashB, repoId);

            if (commitA == null || commitB == null) {
                return CommandResult.failure("One or both commits not found");
            }

            Map<String, Object> parsedA = parseContent((String) commitA.get("content"));
            Map<String, Object> parsedB = parseContent((String) commitB.get("content"));

            String treeHashA = (String) parsedA.get("tree");
            String treeHashB = (String) parsedB.get("tree");

            Map<String, Object> treeObjectA = repository.getObject(treeHashA, repoId);
            Map<String, Object> treeObjectB = repository.getObject(treeHashB, repoId);

            if (treeObjectA == null || treeObjectB == null) {
                return CommandResult.failure("Tree objects not found");
            }

            Map<String, String> entriesA = parseTreeContent((String) treeObjectA.get("content"));
            Map<String, String> entriesB = parseTreeContent((String) treeObjectB.get("content"));

            Map<String, Object> diffResults = new HashMap<>();

            Set<String> allFiles = new HashSet<>();
            allFiles.addAll(entriesA.keySet());
            allFiles.addAll(entriesB.keySet());

            for (String filename : allFiles) {
                String blobHashA = entriesA.get(filename);
                String blobHashB = entriesB.get(filename);

                if (blobHashA == null) {
                    diffResults.put(filename, List.of("+ (new file)"));
                } else if (blobHashB == null) {
                    diffResults.put(filename, List.of("- (deleted)"));
                } else if (!blobHashA.equals(blobHashB)) {
                    // Fetch blobs
                    Map<String, Object> blobA = repository.getObject(blobHashA, repoId);
                    Map<String, Object> blobB = repository.getObject(blobHashB, repoId);

                    if (blobA == null || blobB == null) continue;

                    String contentA = (String) blobA.get("content");
                    String contentB = (String) blobB.get("content");

                    // Remove "blob " prefix
                    contentA = contentA.substring(5);
                    contentB = contentB.substring(5);

                    List<String> diff = diffStrategy.diff(contentA, contentB);

                    diffResults.put(filename, diff);
                }
                // unchanged to skip
            }

            return CommandResult.success("Diff computed", diffResults);

        } catch (Exception e) {
            return CommandResult.failure(e.getMessage());
        }
    }

    private Map<String, Object> parseContent(String content) {
        Map<String, Object> fields = new HashMap<>();

        String[] lines = content.split("\n");
        for (String line : lines) {
            if (line.startsWith("tree "))
                fields.put("tree", line.substring(5));
            else if (line.startsWith("parent "))
                fields.put("parentHash", line.substring(7));
            else if (line.startsWith("author "))
                fields.put("author", line.substring(7));
            else if (line.startsWith("timestamp "))
                fields.put("timestamp", line.substring(10));
            else if (line.startsWith("message "))
                fields.put("message", line.substring(8));
        }

        return fields;
    }

    private Map<String, String> parseTreeContent(String content) {
        Map<String, String> entries = new HashMap<>();

        String[] lines = content.split("\n");
        for (String line : lines) {
            if (line.startsWith("blob ")) {
                String[] parts = line.substring(5).split(" ", 2);
                if (parts.length == 2) {
                    entries.put(parts[1], parts[0]);
                }
            }
        }

        return entries;
    }
}