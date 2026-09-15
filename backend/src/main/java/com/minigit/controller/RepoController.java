package com.minigit.controller;

import com.minigit.command.*;
import com.minigit.model.CommandResult;
import com.minigit.repository.Repository;
import com.minigit.service.LCSDiff;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5174")
public class RepoController {

    @Autowired
    private Repository repository;

    @PostMapping("/init")
    public CommandResult init(@RequestBody InitRequest request) {
        Command command = new InitCommand(request.repoName, request.userId, repository);
        return command.execute();
    }

    @PostMapping("/add")
    public CommandResult add(@RequestBody AddRequest request) {
        Command command = new AddCommand(request.repoId, request.filePath, request.content, repository);
        return command.execute();
    }

    @PostMapping("/commit")
    public CommandResult commit(@RequestBody CommitRequest request) {
        Command command = new CommitCommand(request.repoId, request.message, request.author, repository);
        return command.execute();
    }

    @GetMapping("/log")
    public CommandResult log(@RequestParam String repoId) {
        Command command = new LogCommand(repoId, repository);
        return command.execute();
    }

    @PostMapping("/branch")
    public CommandResult branch(@RequestBody BranchRequest request) {
        Command command = new BranchCommand(request.repoId, request.branchName, repository);
        return command.execute();
    }

    @PostMapping("/checkout")
    public CommandResult checkout(@RequestBody CheckoutRequest request) {
        Command command = new CheckoutCommand(request.repoId, request.targetBranch, repository);
        return command.execute();
    }

    @PostMapping("/diff")
    public CommandResult diff(@RequestBody DiffRequest request) {
        LCSDiff diffStrategy = new LCSDiff();
        Command command = new DiffCommand(request.repoId, request.hashA, request.hashB, repository, diffStrategy);
        return command.execute();
    }

    static class InitRequest {
        public String repoName;
        public String userId;
    }

    static class AddRequest {
        public String repoId;
        public String filePath;
        public String content;
    }

    static class CommitRequest {
        public String repoId;
        public String message;
        public String author;
    }

    static class BranchRequest {
        public String repoId;
        public String branchName;
    }

    static class CheckoutRequest {
        public String repoId;
        public String targetBranch;
    }

    static class DiffRequest {
        public String repoId;
        public String hashA;
        public String hashB;
    }
}