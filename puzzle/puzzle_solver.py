#!/usr/bin/env python3
"""Toy key-space puzzle: educational only.

This deliberately uses a tiny integer key space and SHA-256 as a toy
address function. It does NOT implement Bitcoin private-key recovery and
does not query the blockchain.
"""
import hashlib
import time

START = 1
END = 1_000_000
SECRET_KEY = 731_337  # toy puzzle solution, intentionally tiny

def toy_address(key: int) -> str:
    data = f"toy-key:{key}".encode()
    return hashlib.sha256(data).hexdigest()[:16]

TARGET = toy_address(SECRET_KEY)

def solve():
    started = time.time()
    for key in range(START, END + 1):
        if toy_address(key) == TARGET:
            elapsed = time.time() - started
            rate = key / elapsed if elapsed else 0
            print(f"Solução encontrada: {key}")
            print(f"Alvo: {TARGET}")
            print(f"Tentativas: {key - START + 1:,}")
            print(f"Velocidade: {rate:,.0f} tentativas/s")
            print(f"Tempo: {elapsed:.3f}s")
            return key
        if key % 100_000 == 0:
            elapsed = time.time() - started
            rate = key / elapsed if elapsed else 0
            print(f"Progresso: {key:,}/{END:,} | {rate:,.0f} tentativas/s")
    print("Nenhuma solução encontrada.")
    return None

if __name__ == "__main__":
    solve()
