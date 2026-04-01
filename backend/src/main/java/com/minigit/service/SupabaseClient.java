package com.minigit.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.IOException;
import java.net.URI;
import java.util.Map;

@Service
public class SupabaseClient {
    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api-key}")
    private String supabaseApiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private final ObjectMapper objectMapper = new ObjectMapper();



    public String insert(String table, Map<String, Object> data) throws IOException, InterruptedException {
        // Convert map to JSON
        String json = objectMapper.writeValueAsString(data);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(supabaseUrl + "/rest/v1/" + table))
                .header("apikey", supabaseApiKey)
                .header("Authorization", "Bearer " + supabaseApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    public String select(String table, String query) throws IOException, InterruptedException {
        String url = supabaseUrl + "/rest/v1/" + table;
        if (query != null && !query.isEmpty()) {
            url += "?" + query;
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("apikey", supabaseApiKey)
                .header("Authorization", "Bearer " + supabaseApiKey)
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    public String delete(String table, String query) throws IOException, InterruptedException {
        String url = supabaseUrl + "/rest/v1/" + table;
        if (query != null && !query.isEmpty()) {
            url += "?" + query;
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("apikey", supabaseApiKey)
                .header("Authorization", "Bearer " + supabaseApiKey)
                .header("Content-Type", "application/json")
                .DELETE()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    public String upsert(String table, Map<String, Object> data) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(data);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(supabaseUrl + "/rest/v1/" + table))
                .header("apikey", supabaseApiKey)
                .header("Authorization", "Bearer " + supabaseApiKey)
                .header("Content-Type", "application/json")
                .header("Prefer", "resolution=merge-duplicates")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }   
   
}
