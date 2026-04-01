package com.minigit.model;

import java.time.Instant;

public class Commit extends GitObject{

    private String message; //the commit message
    private String author; //who made the commit
    private String treeHash; //hash of the Tree snapshot
    private String parentHash; //hash of previous commit
    private String timeStamp; //when the commit was made

    public Commit(String message, String author, String treeHash, String parentHash){
        this.message = message;
        this.author = author;
        this.treeHash = treeHash;
        this.parentHash = parentHash;
        this.timeStamp = Instant.now().toString();

        computeHash();       
         
    }

    @Override
    public byte[] serialize(){
        StringBuilder sb = new StringBuilder();

        sb.append("commit\n");
        sb.append("tree ").append(treeHash).append("\n");
        if (parentHash != null){
            sb.append("parent ").append(parentHash).append("\n");
        }
        sb.append("author ").append(author).append("\n").append("timestamp ").append(timeStamp).append("\n");
        sb.append("message ").append(message).append("\n");

        return toBytes(sb.toString());
    }

    public String getMessage(){
        return message;
    }
    public String getAuthor(){
        return author;
    }
    public String getTreeHash(){
        return treeHash;
    }
    public String getParentHash(){
        return parentHash;
    }
    public String getTimeStamp(){
        return timeStamp;
    }   


}
