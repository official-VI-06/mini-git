package com.minigit.command;

import com.minigit.model.CommandResult;
import com.minigit.repository.Repository;

public class BranchCommand implements Command{
    private String repoId;
    private String branchName;
    private Repository repository;

    public BranchCommand(String repoId, String branchName, Repository repository){
        this.repoId = repoId;
        this.branchName = branchName;
        this.repository = repository;
    }

    @Override
    public CommandResult execute(){
        try {
            String currentBranch = repository.getHead(repoId);
            String commitHash = repository.getRef(repoId, currentBranch);

            if (commitHash == null) {
                return CommandResult.failure("Cannot create branch — no commits yet");
            }

            repository.updateRef(repoId, branchName, commitHash);

            return CommandResult.success("Branch created: " + branchName, branchName);
        } catch (Exception e) {
            return CommandResult.failure(e.getMessage());
        }
    }
}
