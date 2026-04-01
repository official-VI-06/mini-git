package com.minigit.model;

public class Blob extends GitObject{
    // The actual content of the file
    private String content;

    public Blob(String content){
        this.content = content;
        computeHash();
    }

    // Each subclass must implement serialize()
    @Override
    public byte[] serialize() {
        return toBytes("blob " + content);
    }

    public String getContent() {
        return content;
    }
}
