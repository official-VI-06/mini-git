package com.minigit.command;

import com.minigit.model.CommandResult;
import com.minigit.repository.Repository;

import java.util.UUID;

public class InitCommand implements Command {
    private String repoId;
    private String repoName;
    private String userId;
    private Repository repository;

    public InitCommand(String repoName, String userId, Repository repository) {
        this.repoName = repoName;
        this.userId = userId;
        this.repository = repository;
        this.repoId = UUID.randomUUID().toString();
    }

    @Override
    public CommandResult execute() {
        try {
            repository.initRepo(repoId, repoName, userId);
            return CommandResult.success("Repository initialized", repoId);
        } catch (Exception e) {
            return CommandResult.failure(e.getMessage());
        }
    }


}
