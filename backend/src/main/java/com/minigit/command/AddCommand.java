package com.minigit.command;

import com.minigit.model.Blob;
import com.minigit.model.CommandResult;
import com.minigit.repository.Repository;


public class AddCommand implements Command{
    private String repoId;
    private String filePath;
    private String content;
    private Repository repository;

    public AddCommand(String repoId, String filePath, String content, Repository repository) {
        this.repoId = repoId;
        this.filePath = filePath;
        this.content = content;
        this.repository = repository;
    }

    @Override
    public CommandResult execute() {
        try {
            Blob blob = new Blob(content);

            repository.saveObject(blob, repoId, "blob");
            repository.stageFile(repoId, filePath, blob.getHash());

            return CommandResult.success("File staged: " + filePath, blob.getHash());
        } catch (Exception e) {
            return CommandResult.failure(e.getMessage());
        }
    }

}
