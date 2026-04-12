#!/usr/bin/env python3
"""
fetch_zabbix_stats.py
Busca o número de hosts monitorados no Zabbix e salva em assets/data/stats.json
Credenciais via variáveis de ambiente (GitHub Secrets).
"""

import os
import json
import requests
from datetime import datetime, timezone

ZABBIX_URL  = os.environ["ZABBIX_URL"].rstrip("/")   # ex: https://monitor.dsr9.com
ZABBIX_USER = os.environ["ZABBIX_USER"]
ZABBIX_PASS = os.environ["ZABBIX_PASS"]
OUTPUT_FILE = "assets/data/stats.json"

session = requests.Session()
session.headers.update({"Content-Type": "application/json-rpc"})

def rpc(method, params, auth=None):
    payload = {
        "jsonrpc": "2.0",
        "method":  method,
        "params":  params,
        "id":      1,
    }
    if auth:
        payload["auth"] = auth

    resp = session.post(
        f"{ZABBIX_URL}/api_jsonrpc.php",
        json=payload,
        timeout=15,
        verify=True,
    )
    resp.raise_for_status()
    data = resp.json()

    if "error" in data:
        raise RuntimeError(f"Zabbix API erro: {data['error']}")

    return data["result"]


def main():
    print(f"[zabbix] Conectando em {ZABBIX_URL} ...")

    # ── 1. Login ──────────────────────────────────────────────
    token = rpc("user.login", {
        "username": ZABBIX_USER,   # Zabbix ≥ 5.4
        "password": ZABBIX_PASS,
    })
    # Fallback para Zabbix < 5.4 (campo "user" em vez de "username")
    if not token:
        token = rpc("user.login", {
            "user":     ZABBIX_USER,
            "password": ZABBIX_PASS,
        })
    print(f"[zabbix] Login OK (token: {token[:8]}...)")

    # ── 2. Total de hosts monitorados (status=0 = enabled) ───
    hosts = rpc("host.get", {
        "countOutput": True,
        "filter": {"status": 0},    # 0 = monitorado, 1 = desabilitado
    }, auth=token)
    total_devices = int(hosts)
    print(f"[zabbix] Hosts monitorados: {total_devices}")

    # ── 3. (Opcional) Problemas ativos ────────────────────────
    try:
        problems = rpc("problem.get", {
            "countOutput": True,
            "recent":      True,
        }, auth=token)
        total_problems = int(problems)
    except Exception:
        total_problems = 0
    print(f"[zabbix] Problemas ativos: {total_problems}")

    # ── 4. Logout ─────────────────────────────────────────────
    try:
        rpc("user.logout", [], auth=token)
    except Exception:
        pass

    # ── 5. Salvar JSON ────────────────────────────────────────
    stats = {
        "devices":   total_devices,
        "problems":  total_problems,
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(stats, f, indent=2)

    print(f"[zabbix] Salvo em {OUTPUT_FILE}: {stats}")


if __name__ == "__main__":
    main()
