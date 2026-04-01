package com.minigit.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minigit.model.GitObject;
import com.minigit.service.SupabaseClient;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class Repository {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private SupabaseClient supabaseClient;

    public void saveObject(GitObject object, String repoId, String type) throws Exception {
        Map<String, Object> data = new HashMap<>();

        data.put("hash", object.getHash());
        data.put("repo_id", repoId);
        data.put("type", type);
        data.put("content", new String(object.serialize()));

        supabaseClient.insert("objects", data);
    }

    public void stageFile(String repoId, String filePath, String blobHash) throws Exception {
        Map<String, Object> data = new HashMap<>();

        data.put("repo_id", repoId);
        data.put("file_path", filePath);
        data.put("blob_hash", blobHash);

        supabaseClient.insert("staging", data);
    }

    public List<Map<String, Object>> getStagedFiles(String repoId) throws Exception {
        String response = supabaseClient.select("staging", "repo_id=eq." + repoId);

        return objectMapper.readValue(
                response,
                new TypeReference<List<Map<String, Object>>>() {}
        );
    }

    public void clearStaging(String repoId) throws Exception {
        supabaseClient.delete("staging", "repo_id=eq." + repoId);
    }

    public String getHead(String repoId) throws Exception {
        String response = supabaseClient.select("head", "repo_id=eq." + repoId);

        List<Map<String, Object>> result = objectMapper.readValue(
                response,
                new TypeReference<List<Map<String, Object>>>() {}
        );

        if (result.isEmpty()) {
            return null;
        }

        return (String) result.get(0).get("branch_name");
    }

    public void updateRef(String repoId, String branchName, String commitHash) throws Exception {
        Map<String, Object> data = new HashMap<>();

        data.put("repo_id", repoId);
        data.put("name", branchName);
        data.put("commit_hash", commitHash);

        supabaseClient.upsert("refs", data);
    }

    public String getRef(String repoId, String branchName) throws Exception {
        String query = "repo_id=eq." + repoId + "&name=eq." + branchName;
        String response = supabaseClient.select("refs", query);

        List<Map<String, Object>> result = objectMapper.readValue(
                response,
                new TypeReference<List<Map<String, Object>>>() {}
        );

        if (result.isEmpty()) {
            return null;
        }

        return (String) result.get(0).get("commit_hash");
    }

    public String initRepo(String repoId, String repoName, String userId) throws Exception {
        Map<String, Object> repoData = new HashMap<>();
        repoData.put("id", repoId);
        repoData.put("name", repoName);
        repoData.put("user_id", userId);

        supabaseClient.insert("repos", repoData);

        Map<String, Object> headData = new HashMap<>();
        headData.put("repo_id", repoId);
        headData.put("branch_name", "main");

        supabaseClient.insert("head", headData);

        return repoId;
    }

    public Map<String, Object> getObject(String hash, String repoId) throws Exception {
        String response = supabaseClient.select("objects", "hash=eq." + hash + "&repo_id=eq." + repoId);
        List<Map<String, Object>> result = objectMapper.readValue(
            response,
            new TypeReference<List<Map<String, Object>>>() {}
        );
        if (result.isEmpty()) return null;
        return result.get(0);
    }

    public void updateHead(String repoId, String branchName) throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("repo_id", repoId);
        data.put("branch_name", branchName);
        supabaseClient.upsert("head", data);
    }
}