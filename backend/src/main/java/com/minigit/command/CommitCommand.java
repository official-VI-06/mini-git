package com.minigit.command;

import com.minigit.model.Commit;
import com.minigit.model.CommandResult;
import com.minigit.model.Tree;
import com.minigit.repository.Repository;

import java.util.List;
import java.util.Map;

public class CommitCommand implements Command {

    private String repoId;
    private String message;
    private String author;
    private Repository repository;

    public CommitCommand(String repoId, String message, String author, Repository repository) {
        this.repoId = repoId;
        this.message = message;
        this.author = author;
        this.repository = repository;
    }

    @Override
    public CommandResult execute() {
        try {
            List<Map<String, Object>> stagedFiles = repository.getStagedFiles(repoId);
            if (stagedFiles.isEmpty()) {
                return CommandResult.failure("Nothing to commit");
            }

            Tree tree = new Tree();
            for (Map<String, Object> file : stagedFiles) {
                String filePath = (String) file.get("file_path");
                String blobHash = (String) file.get("blob_hash");
                tree.addEntry(filePath, blobHash);
            }
            tree.computeHash();

            repository.saveObject(tree, repoId, "tree");

            String currentBranch = repository.getHead(repoId);
            String parentHash = repository.getRef(repoId, currentBranch);

            Commit commit = new Commit(message, author, tree.getHash(), parentHash);
            repository.saveObject(commit, repoId, "commit");

            repository.updateRef(repoId, currentBranch, commit.getHash());
            repository.clearStaging(repoId);

            return CommandResult.success("Committed successfully", commit.getHash());

        } catch (Exception e) {
            return CommandResult.failure(e.getMessage());
        }
    }
}