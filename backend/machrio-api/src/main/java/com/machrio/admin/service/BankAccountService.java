package com.machrio.admin.service;

import com.machrio.admin.dto.CreateBankAccountRequest;
import com.machrio.admin.dto.BankAccountDTO;
import com.machrio.admin.dto.PageResponse;
import com.machrio.admin.entity.BankAccount;
import com.machrio.admin.repository.BankAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.of("UTC"));

    public PageResponse<BankAccountDTO> getAllBankAccounts(int page, int pageSize, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("sortOrder").ascending().and(Sort.by("country").ascending()));

        Page<BankAccount> bankAccountPage;
        if (search != null && !search.isBlank()) {
            bankAccountPage = bankAccountRepository.searchByKeyword(search, pageRequest);
        } else {
            bankAccountPage = bankAccountRepository.findAll(pageRequest);
        }

        List<BankAccountDTO> dtos = bankAccountPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.from(bankAccountPage, dtos);
    }

    public List<BankAccountDTO> getActiveBankAccounts() {
        return bankAccountRepository.findByActiveTrueOrderBySortOrderAscCountryAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BankAccountDTO> getBankAccountsByCountry(String country) {
        return bankAccountRepository.findByCountryAndActiveTrueOrderBySortOrderAsc(country).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public BankAccountDTO getBankAccountById(UUID id) {
        BankAccount bankAccount = bankAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bank account not found: " + id));
        return toDTO(bankAccount);
    }

    @Transactional
    public BankAccountDTO createBankAccount(CreateBankAccountRequest request) {
        BankAccount bankAccount = new BankAccount();
        updateBankAccountFromRequest(bankAccount, request);
        bankAccount = bankAccountRepository.save(bankAccount);
        return toDTO(bankAccount);
    }

    @Transactional
    public BankAccountDTO updateBankAccount(UUID id, CreateBankAccountRequest request) {
        BankAccount bankAccount = bankAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bank account not found: " + id));

        updateBankAccountFromRequest(bankAccount, request);
        bankAccount = bankAccountRepository.save(bankAccount);
        return toDTO(bankAccount);
    }

    @Transactional
    public void deleteBankAccount(UUID id) {
        if (!bankAccountRepository.existsById(id)) {
            throw new RuntimeException("Bank account not found: " + id);
        }
        bankAccountRepository.deleteById(id);
    }

    private void updateBankAccountFromRequest(BankAccount bankAccount, CreateBankAccountRequest request) {
        bankAccount.setCountry(request.getCountry());
        bankAccount.setBankName(request.getBankName());
        bankAccount.setAccountName(request.getAccountName());
        bankAccount.setBeneficiaryName(request.getBeneficiaryName());
        bankAccount.setAccountNumber(request.getAccountNumber());
        bankAccount.setCurrency(request.getCurrency());
        bankAccount.setSwiftCode(request.getSwiftCode());
        bankAccount.setLocalBankCode(request.getLocalBankCode());
        bankAccount.setLocalBankCodeLabel(request.getLocalBankCodeLabel());
        bankAccount.setRoutingNumber(request.getRoutingNumber());
        bankAccount.setIban(request.getIban());
        bankAccount.setSortCode(request.getSortCode());
        bankAccount.setBankAddress(request.getBankAddress());
        bankAccount.setAdditionalInfo(request.getAdditionalInfo());
        bankAccount.setFlag(request.getFlag());
        bankAccount.setSortOrder(request.getSortOrder());
        bankAccount.setActive(request.getActive());
    }

    private BankAccountDTO toDTO(BankAccount bankAccount) {
        BankAccountDTO dto = new BankAccountDTO();
        dto.setId(bankAccount.getId());
        dto.setCountry(bankAccount.getCountry());
        dto.setBankName(bankAccount.getBankName());
        dto.setAccountName(bankAccount.getAccountName());
        dto.setBeneficiaryName(bankAccount.getBeneficiaryName());
        dto.setAccountNumber(bankAccount.getAccountNumber());
        dto.setCurrency(bankAccount.getCurrency());
        dto.setSwiftCode(bankAccount.getSwiftCode());
        dto.setLocalBankCode(bankAccount.getLocalBankCode());
        dto.setLocalBankCodeLabel(bankAccount.getLocalBankCodeLabel());
        dto.setRoutingNumber(bankAccount.getRoutingNumber());
        dto.setIban(bankAccount.getIban());
        dto.setSortCode(bankAccount.getSortCode());
        dto.setBankAddress(bankAccount.getBankAddress());
        dto.setAdditionalInfo(bankAccount.getAdditionalInfo());
        dto.setFlag(bankAccount.getFlag());
        dto.setSortOrder(bankAccount.getSortOrder());
        dto.setActive(bankAccount.getActive());
        dto.setCreatedAt(bankAccount.getCreatedAt() != null ? FORMATTER.format(bankAccount.getCreatedAt()) : null);
        dto.setUpdatedAt(bankAccount.getUpdatedAt() != null ? FORMATTER.format(bankAccount.getUpdatedAt()) : null);
        return dto;
    }
}
