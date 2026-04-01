package com.minigit.service;

import java.util.List;

public interface DiffStrategy {
    List<String> diff(String contentA, String contentB);
}