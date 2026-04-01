package com.minigit.model;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;

public abstract class GitObject {

    // Every Git object has a hash
    protected String hash;

    // Each subclass MUST implement how it serializes itself
    public abstract byte[] serialize();

    // Computes hash using serialized data 
    public void computeHash() {
        byte[] data = serialize();
        this.hash = sha1(data);
    }

    // Getter for hash
    public String getHash() {
        return hash;
    }

    // SHA-1 hashing logic
    protected String sha1(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hashBytes = digest.digest(data);

            StringBuilder hexString = new StringBuilder();

            for (byte b : hashBytes) {
                hexString.append(String.format("%02x", b));
            }

            return hexString.toString();

        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-1 algorithm not found", e);
        }
    }

    // Helper method for subclasses to convert string → bytes
    protected byte[] toBytes(String s) {
        return s.getBytes(StandardCharsets.UTF_8);
    }
}