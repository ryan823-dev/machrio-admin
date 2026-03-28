package com.machrio.admin.controller;

import com.machrio.admin.dto.BankAccountDTO;
import com.machrio.admin.dto.CreateBankAccountRequest;
import com.machrio.admin.service.BankAccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bank-accounts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BankAccountController {

    @Autowired
    private BankAccountService bankAccountService;

    @GetMapping
    public ResponseEntity<List<BankAccountDTO>> getAllBankAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search) {
        List<BankAccountDTO> accounts = bankAccountService.getAllBankAccounts(page, pageSize, search);
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/active")
    public ResponseEntity<List<BankAccountDTO>> getActiveBankAccounts() {
        List<BankAccountDTO> accounts = bankAccountService.getActiveBankAccounts();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/country/{country}")
    public ResponseEntity<List<BankAccountDTO>> getBankAccountsByCountry(@PathVariable String country) {
        List<BankAccountDTO> accounts = bankAccountService.getBankAccountsByCountry(country);
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BankAccountDTO> getBankAccountById(@PathVariable UUID id) {
        BankAccountDTO account = bankAccountService.getBankAccountById(id);
        return ResponseEntity.ok(account);
    }

    @PostMapping
    public ResponseEntity<BankAccountDTO> createBankAccount(@Valid @RequestBody CreateBankAccountRequest request) {
        BankAccountDTO account = bankAccountService.createBankAccount(request);
        return ResponseEntity.ok(account);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BankAccountDTO> updateBankAccount(
            @PathVariable UUID id,
            @Valid @RequestBody CreateBankAccountRequest request) {
        BankAccountDTO account = bankAccountService.updateBankAccount(id, request);
        return ResponseEntity.ok(account);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBankAccount(@PathVariable UUID id) {
        bankAccountService.deleteBankAccount(id);
        return ResponseEntity.noContent().build();
    }
}
