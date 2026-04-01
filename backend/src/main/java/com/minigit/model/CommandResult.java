package com.minigit.model;

public class CommandResult {
    private boolean success;
    private String message;
    private Object data;

    public CommandResult(boolean success, String message, Object data){
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public CommandResult(boolean success, String message) {
        this(success, message, null);
    }
    
    
    // Success with data
    public static CommandResult success(String message, Object data) {
        return new CommandResult(true, message, data);
    }

    // Success without data
    public static CommandResult success(String message) {
        return new CommandResult(true, message, null);
    }

    // Failure
    public static CommandResult failure(String message) {
        return new CommandResult(false, message, null);
    }

    public boolean isSuccess(){
        return success;
    }

    public String getMessage(){
        return message;
    }

    public Object getData(){
        return data;
    }
}
