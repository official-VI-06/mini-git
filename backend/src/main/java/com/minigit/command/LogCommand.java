package com.minigit.command;

import com.minigit.model.CommandResult;
import com.minigit.repository.Repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LogCommand implements Command {

    private String repoId;
    private Repository repository;

    public LogCommand(String repoId, Repository repository) {
        this.repoId = repoId;
        this.repository = repository;
    }

    @Override
    public CommandResult execute() {
        try {
            // Step 1 - Get current branch and latest commit
            String currentBranch = repository.getHead(repoId);
            String commitHash = repository.getRef(repoId, currentBranch);

            // Step 2 - Check if commits exist
            if (commitHash == null) {
                return CommandResult.failure("No commits yet");
            }

            // Step 3 - Traverse commit chain
            List<Map<String, Object>> commits = new ArrayList<>();

            while (commitHash != null) {
                Map<String, Object> object = repository.getObject(commitHash);
                if (object == null) break;

                String content = (String) object.get("content");

                Map<String, Object> fields = parseCommitContent(content);
                fields.put("hash", commitHash);

                commits.add(fields);

                // Move to parent commit
                commitHash = (String) fields.get("parentHash");
            }

            // Step 5 - Return result
            return CommandResult.success("Log retrieved", commits);

        } catch (Exception e) {
            return CommandResult.failure(e.getMessage());
        }
    }

    private Map<String, Object> parseCommitContent(String content) {
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
}