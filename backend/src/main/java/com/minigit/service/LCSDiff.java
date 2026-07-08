package com.minigit.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LCSDiff implements DiffStrategy {

    @Override
    public List<String> diff(String contentA, String contentB) {
        String[] linesA = contentA.split("\n");
        String[] linesB = contentB.split("\n");

        int[][] dp = buildLCSTable(linesA, linesB);

        return backtrack(dp, linesA, linesB, linesA.length, linesB.length);
    }

    private int[][] buildLCSTable(String[] a, String[] b) {
        int m = a.length;
        int n = b.length;

        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (a[i - 1].equals(b[j - 1])) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        return dp;
    }

    private List<String> backtrack(int[][] dp, String[] a, String[] b, int i, int j) {
        if (i == 0 && j == 0) {
            return new ArrayList<>();
        } else if (i == 0) {
            List<String> result = backtrack(dp, a, b, i, j - 1);
            result.add("+ " + b[j - 1]);
            return result;
        } else if (j == 0) {
            List<String> result = backtrack(dp, a, b, i - 1, j);
            result.add("- " + a[i - 1]);
            return result;
        } else if (a[i - 1].equals(b[j - 1])) {
            List<String> result = backtrack(dp, a, b, i - 1, j - 1);
            result.add("  " + a[i - 1]);
            return result;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            List<String> result = backtrack(dp, a, b, i - 1, j);
            result.add("- " + a[i - 1]);
            return result;
        } else {
            List<String> result = backtrack(dp, a, b, i, j - 1);
            result.add("+ " + b[j - 1]);
            return result;
        }
    }
}