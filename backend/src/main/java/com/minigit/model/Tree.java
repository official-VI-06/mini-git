package com.minigit.model;

import java.util.HashMap;
import java.util.Map;

public class Tree extends GitObject {
    private Map<String, String> entries;

    public Tree(){
        this.entries = new HashMap<>();
    }

    public void addEntry(String filename, String blobHash){
        entries.put(filename, blobHash);
    }

    @Override
    public byte[] serialize(){
        StringBuilder sb = new StringBuilder();
        sb.append("tree\n");

        for (Map.Entry<String, String> entry : entries.entrySet()) {
            sb.append("blob ").append(entry.getValue())
              .append(" ").append(entry.getKey())
              .append("\n");
        }

        return toBytes(sb.toString());
    }

    public Map<String, String> getEntries() {
        return entries;
    }
}
