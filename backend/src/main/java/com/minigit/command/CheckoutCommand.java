package com.minigit.command;

import com.minigit.model.CommandResult;
import com.minigit.repository.Repository;

public class CheckoutCommand implements Command {
    private String repoId;
    private String targetBranch;
    private Repository repository;

    public CheckoutCommand(String repoId, String targetBranch, Repository repository){
        this.repoId = repoId;
        this.targetBranch = targetBranch;
        this.repository = repository;
    }

    @Override
    public CommandResult execute(){
        try {
            String commitHash = repository.getRef(repoId, targetBranch);
            if (commitHash == null) {
                return CommandResult.failure("Branch does not exist: " + targetBranch);
            }

            repository.updateHead(repoId, targetBranch);
            
            return CommandResult.success("Switched to branch: " + targetBranch, targetBranch);
        } catch (Exception e) {
            return CommandResult.failure(e.getMessage());
        }
    }
}
